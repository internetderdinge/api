import passport from "passport";
import httpStatus from "http-status";
import { expressjwt as jwt } from "express-jwt";
import crypto from "crypto";
import jwksRsa from "jwks-rsa";
import type { Request, Response, NextFunction } from "express";
import ApiError from "../utils/ApiError";
import Token from "../tokens/tokens.model";
import { roleRights } from "../config/roles";

interface AuthRequest extends Request {
  auth?: {
    id: string;
    tokenId: string;
    type: string;
    [key: string]: any; // Additional user data
  };
}

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
          const roles = ["api"];

          req.auth = {
            id: ownerId,
            tokenId: tokenDoc._id,
            type: "api",
            // For API-key auth, we can treat the token owner as the subject.
            // Avoid fetching user profile from Auth0 Management API on every request.
            sub: ownerId,
            "https://memo.wirewire.de/roles": roles,
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
