// @ts-nocheck
import passport from "passport";
import httpStatus from "http-status";
import { expressjwt as jwt } from "express-jwt";
import crypto from "crypto";
import jwksRsa from "jwks-rsa";
import type { Request, Response, NextFunction } from "express";
import ApiError from "../utils/ApiError";
import Token from "../tokens/tokens.model";
import { roleRights } from "../config/roles";
import auth0Service from "../accounts/auth0.service";

const ROLES_CLAIM = "https://memo.wirewire.de/roles";
const AUTH0_ROLE_CACHE_TTL_MS = 5 * 60 * 1000;

type RoleCacheEntry = {
  roles: string[];
  expiresAt: number;
};

const auth0RolesCache = new Map<string, RoleCacheEntry>();

const dedupeRoles = (roles: string[]): string[] =>
  Array.from(new Set(roles.map((role) => role.trim()).filter(Boolean)));

const extractRoleNamesFromManagementResponse = (payload: unknown): string[] => {
  const iterablePayload =
    payload && typeof (payload as any)[Symbol.iterator] === "function"
      ? Array.from(payload as Iterable<unknown>)
      : [];

  const list = Array.isArray(payload)
    ? payload
    : Array.isArray((payload as any)?.data)
      ? (payload as any).data
      : Array.isArray((payload as any)?.items)
        ? (payload as any).items
        : iterablePayload;

  const roleNames = list
    .map((entry: Record<string, unknown>) =>
      typeof entry?.name === "string" ? entry.name : "",
    )
    .filter(Boolean);

  return dedupeRoles(roleNames);
};

const getAuth0RolesByOwner = async (ownerId: string): Promise<string[]> => {
  const now = Date.now();
  const cached = auth0RolesCache.get(ownerId);
  if (cached && cached.expiresAt > now) {
    // return cached.roles;
  }

  try {
    console.log(
      `Fetching Auth0 roles for owner ${ownerId} from Management API...`,
    );
    const rolesPayload = await (auth0Service as any).auth0.users.roles.list(
      ownerId,
    );
    console.log(`Fetched Auth0 roles for owner ${ownerId}:`, rolesPayload);
    const roles = extractRoleNamesFromManagementResponse(rolesPayload);

    auth0RolesCache.set(ownerId, {
      roles,
      expiresAt: now + AUTH0_ROLE_CACHE_TTL_MS,
    });

    return roles;
  } catch (error) {
    console.warn("auth middleware: could not fetch Auth0 roles for owner", {
      ownerId,
      error,
    });
    return [];
  }
};

type AuthRequest = Request;

type VerifyCallback = (
  req: AuthRequest,
  resolve: () => void,
  reject: (error: ApiError) => void,
  requiredRights: string[],
) => (err: any, user: any, info: any) => Promise<void>;

const verifyCallback: VerifyCallback =
  (req, resolve, reject, requiredRights) => async (err, user, info) => {
    if (err || info || !user) {
      return reject(
        new ApiError(httpStatus.UNAUTHORIZED, "Please authenticate"),
      );
    }
    req.user = user;

    if (requiredRights.length) {
      const userRights = roleRights.get(user.role) || [];
      const hasRequiredRights = requiredRights.every((requiredRight) =>
        userRights.includes(requiredRight),
      );
      if (!hasRequiredRights && req.params.userId !== user.id) {
        return reject(new ApiError(httpStatus.FORBIDDEN, "Forbidden"));
      }
    }
    resolve();
  };

const auth = function authFactory(...requiredRights: string[]) {
  return async function authMiddleware(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      // Check for custom token in X-API-Key header
      const apiKey = req.headers["x-api-key"] as string | undefined;
      if (apiKey && apiKey.length === 64) {
        // 32 bytes hex encoded
        const hashedToken = crypto
          .createHash("sha256")
          .update(apiKey)
          .digest("hex");
        const tokenDoc: any = await Token.findOne({
          value: hashedToken,
        }).select("+owner");

        if (tokenDoc) {
          const ownerId = tokenDoc.owner as string;

          const auth0Roles = await getAuth0RolesByOwner(ownerId);
          console.log(
            `Authenticated API token request for owner ${ownerId}`,
            auth0Roles,
            ROLES_CLAIM,
            "aaa",
          );
          req.auth = {
            id: ownerId,
            tokenId: tokenDoc._id,
            type: "api",
            // For API-key auth, we can treat the token owner as the subject.
            // Avoid fetching user profile from Auth0 Management API on every request.
            sub: ownerId,
            [ROLES_CLAIM]: auth0Roles,
          };
          return next();
        }
      }

      // Fallback to Auth0 JWT validation
      jwt({
        secret: jwksRsa.expressJwtSecret({
          cache: true,
          rateLimit: true,
          jwksRequestsPerMinute: 5,
          jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
        }),
        issuer: `https://${process.env.AUTH0_DOMAIN}/`,
        algorithms: ["RS256"],
      })(req, res, (err) => {
        if (err) {
          const status = err.status || 500;
          const message =
            err.message || "Sorry we were unable to process your request.";
          return res.status(status).send({ message });
        }

        next();
      });
    } catch (error) {
      next(error);
    }
  };
};

export default auth;
