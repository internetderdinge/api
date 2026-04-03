import httpStatus from "http-status";
import ApiError from "../utils/ApiError";
import userService from "../users/users.service";

import type { Request, Response, NextFunction } from "express";

export const validateCurrentUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // TODO: Check if the user is logged in
    const currentUser = await userService.getUserByOwner(
      res.req.auth.sub,
      req.body.organization,
    );
    if (!currentUser) {
      next(new ApiError(httpStatus.BAD_REQUEST, "User does not exist"));
      return;
    }
    req.currentUser = currentUser;
    next();
  } catch (error) {
    console.error("Error validating user service:", error);
    next(
      new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "Failed to validate user service",
      ),
    );
  }
};

export default validateCurrentUser;
