import httpStatus from "http-status";
import pick from "../utils/pick.js";
import ApiError from "../utils/ApiError.js";
import crypto from "crypto";
import catchAsync from "../utils/catchAsync.js";
import * as userService from "./users.service.js";
import * as devicesService from "../devices/devices.service";
// import userImageUpload from '../files/upload.service';
import auth0Service from "../accounts/auth0.service";
import { sendEmail } from "../email/email.service";
import type { Request, Response } from "express";

type AuthRequest<P = any, B = any, Q = any> = Request<P, any, B, Q> & {
  auth: { sub: string };
};

export const createUser = catchAsync(
  async (req: AuthRequest<{}, any, {}>, res: Response) => {
    const { body } = req;
    if (body.email) {
      const auth0user = await auth0Service.getUserIdByEmail(body.email);
      body.status = "invited";
      body.inviteCode = crypto.randomBytes(48).toString("base64url");

      if (auth0user.data[0]) {
        const userFound = await userService.getUserByOwner(
          auth0user.data[0].user_id,
          body.organization,
        );
        if (userFound) {
          throw new ApiError(
            httpStatus.CONFLICT,
            "User already added in organization",
          );
        }
      }
    }

    const user = await userService.createUser(body);

    if (body.email) {
      await userService.sendInviteEmail({
        user,
        email: body.email,
        inviteCode: body.inviteCode!,
        auth: req.auth,
      });
    }

    res.status(httpStatus.CREATED).send(user);
  },
);

export const createCurrentUser = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const user = await userService.createUser({ owner: req.auth.sub });
    res.status(httpStatus.CREATED).send(user);
  },
);

export const sendVerificationEmail = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const result = await auth0Service.sendVerificationEmail(req.auth.sub);
    res
      .status(httpStatus.OK)
      .send({ message: "Verification email sent", status: result?.status });
  },
);

export const getUsers = catchAsync(async (req: Request, res: Response) => {
  // console.log('getUsers', req.query);
  const filter = pick(req.query, ["name", "role"]);
  const options = pick(req.query, ["sortBy", "limit", "page"]);
  options.fuzzySearch = req.query.search
    ? {
        search: req.query.search,
        index: "users",
        fields: ["meta.firstName", "meta.lastName"],
      }
    : undefined;
  const result = await userService.queryUsers(
    { ...filter, organization: req.query.organization },
    options,
  );
  // console.log('getUsers result', req.currentUser);
  if (
    req.currentUser?.role &&
    req.currentUser.role === "onlyself" &&
    result?.results
  ) {
    // If the user is onlyself, restrict the results to their own user document
    result.results = result.results.filter(
      (user) => user.owner === req.auth.sub,
    );
  }
  res.send(result);
});

export const getCurrentUser = catchAsync(
  async (
    req: AuthRequest<{}, any, { organization?: string }>,
    res: Response,
  ) => {
    const result = await userService.getUserByOwner(
      req.auth.sub,
      req.query.organization,
    );
    res.send(result);
  },
);

export const getUserImage = catchAsync(async (_req: Request, res: Response) => {
  try {
    // await userImageUpload.getPhoto(req.query.file, res);
  } catch (error: any) {
    res.status(500).json(`Failed to receive image file: ${error.message}`);
  }
});

export const updateUserImage = catchAsync(
  async (_req: Request, _res: Response) => {
    // placeholder for image upload
  },
);

export const getUser = catchAsync(
  async (req: Request<{ userId: string }>, res: Response) => {
    const user = await userService.getByIdWithAuth0(req.params.userId);
    if (!user) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        `User not found ID: ${req.params.userId}`,
      );
    }
    res.send(user);
  },
);

export const updateUser = catchAsync(
  async (
    req: Request<{ userId: string }, any, any, any> & { auth: any },
    res: Response,
  ) => {
    const authReq = req as AuthRequest<{ userId: string }, any, any>;
    const user = await userService.updateUserById(
      authReq.params.userId,
      authReq.body,
      authReq.auth,
    );
    res.send(user);
  },
);

export const deleteUser = catchAsync(
  async (req: Request<{ userId: string }>, res: Response) => {
    const devices = await devicesService.getDeviceByUserId(req.params.userId);
    if (devices) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        "User still has devices assigned",
      );
    }
    const user = await userService.deleteUserById(req.params.userId);
    res.send(user);
  },
);

export const getInvite = catchAsync(
  async (
    req: Request<{ inviteCode: string }> & { auth: any },
    res: Response,
  ) => {
    // console.log('getInvite', req.params.inviteCode);
    const authReq = req as AuthRequest<{ inviteCode: string }>;
    const user = await userService.getInvite({
      inviteCode: authReq.params.inviteCode,
    });
    if (!user) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        `User not found token: ${authReq.params.inviteCode}`,
      );
    }
    const already = await userService.getUserByOwner(
      authReq.auth.sub,
      user.organization,
    );
    if (already) {
      throw new ApiError(httpStatus.CONFLICT, "User already in organization");
    }
    res.send(user);
  },
);

export const updateInvite = catchAsync(
  async (req: AuthRequest<{}, any, any>, res: Response) => {
    const user = await userService.updateInvite({
      owner: req.auth.sub,
      ...req.body,
    });
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    }
    res.send(user);
  },
);

export const organizationUpdate = catchAsync(
  async (req: Request<any, any, any>, res: Response) => {
    const user = await userService.organizationUpdate(req.body);
    res.send(user);
  },
);

export const organizationRemove = catchAsync(
  async (req: Request<any, any, any>, res: Response) => {
    const user = await userService.organizationRemove(req.body);
    res.send(user);
  },
);

export const cleanup = catchAsync(async (_req: Request, res: Response) => {
  const all = await userService.queryAllCalendars();
  const filtered = all.filter((e) => e.organizationData === null);
  const ids = filtered.map((e) => e._id);
  const deleted = await userService.deleteMany(ids);
  res.send({
    deleted,
    ids,
    filteredCount: filtered.length,
    totalCount: all.length,
    filtered,
  });
});
