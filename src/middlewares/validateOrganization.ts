import type { Request, Response, NextFunction } from "express";
import type { UserService } from "../users/users.service";
import userService from "../users/users.service";

import httpStatus from "http-status";
import ApiError from "../utils/ApiError";
import { isAdmin } from "./validateAdmin";

export const validateUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  next();
};

export const validateOrganization = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  if (isAdmin(res.req.auth)) {
    next();
  } else {
    const currentUser = await userService.getUserByOwner(
      res.req.auth.sub,
      req.params.organizationId,
    );
    if (!currentUser) {
      next(
        new ApiError(
          httpStatus.FORBIDDEN,
          "User is not part of the organization (validateOrganization)",
        ),
      );
      return;
    }
    /* if (currentUser.role && currentUser.role === 'onlyself') {
      next(new ApiError(httpStatus.FORBIDDEN, 'User does not have sufficient permissions in the organization'));
      return;
    } */
    req.currentUser = currentUser;
    next();
  }
};

export const validateQueryOrganization = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  if (isAdmin(res.req.auth)) {
    next();
  } else {
    const currentUser = await userService.getUserByOwner(
      res.req.auth.sub,
      req.query.organization,
    );
    if (!currentUser) {
      next(
        new ApiError(
          httpStatus.FORBIDDEN,
          "User is not part of the organization (validateQueryOrganization)",
        ),
      );
      return;
    }

    /* if (currentUser.role && currentUser.role === 'onlyself') {
      next(new ApiError(httpStatus.FORBIDDEN, 'User does not have sufficient permissions in the organization'));
      return;
    } */
    req.currentUser = currentUser;
    next();
  }
};

export const validateBodyOrganization = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  if (isAdmin(res.req.auth)) {
    next();
  } else {
    const currentUser = await userService.getUserByOwner(
      res.req.auth.sub,
      req.body.organization,
    );
    if (!currentUser) {
      next(
        new ApiError(
          httpStatus.FORBIDDEN,
          "User is not part of the organization (validateBodyOrganization)",
        ),
      );
      return;
    }
    req.currentUser = currentUser;
    next();
  }
};

export default {
  validateOrganization,
  validateQueryOrganization,
  validateBodyOrganization,
  validateUser,
};
