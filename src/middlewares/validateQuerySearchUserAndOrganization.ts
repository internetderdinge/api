import httpStatus from "http-status";
import ApiError from "../utils/ApiError";
import { isAdmin } from "./validateAdmin";
import type { Request, Response, NextFunction } from "express";
import userService from "../users/users.service";
import type { UserService } from "../users/users.service";

const validateQuerySearchUserAndOrganization = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  if (isAdmin(res.req.auth)) {
    next();
  } else {
    console.log("validateQuerySearchUserAndOrganization", req.query);
    if (req.query.organization) {
      const currentUser = await userService.getUserByOwner(
        res.req.auth.sub,
        req.query.organization as string,
      );
      if (!currentUser) {
        next(
          new ApiError(
            httpStatus.FORBIDDEN,
            "User is not part of the organization (validateQuerySearchUserAndOrganization)",
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
    } else if (req.query.patient) {
      const activeUser = await userService.getById(req.query.patient as string);
      if (!activeUser) {
        next(
          new ApiError(
            httpStatus.FORBIDDEN,
            "User not found (validateQuerySearchUserAndOrganization)",
          ),
        );
        return;
      }
      const currentUser = await userService.getUserByOwner(
        res.req.auth.sub,
        activeUser.organization,
      );

      if (!currentUser) {
        next(
          new ApiError(
            httpStatus.FORBIDDEN,
            "User is not part of the organization which has access to the device (validateDevice)",
          ),
        );
        return;
      }
      req.currentUser = currentUser;
      next();
    } else {
      next(
        new ApiError(
          httpStatus.FORBIDDEN,
          "No filter defined (validateQuerySearchUserAndOrganization)",
        ),
      );
    }
  }
};

export { validateQuerySearchUserAndOrganization };
