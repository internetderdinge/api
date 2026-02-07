import httpStatus from "http-status";
import ApiError from "../utils/ApiError";
import usersService from "../users/users.service";
import { isAdmin } from "./validateAdmin";

import type { Request, Response, NextFunction } from "express";
import type { User } from "../users/users.types";

// extend makeValidateUser to accept an optional key (defaulting to 'patient')
const makeValidateUser =
  (source: "query" | "body" | "params", key: string = "patient") =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const context = `validate${source.charAt(0).toUpperCase() + source.slice(1)}User`;
    if (isAdmin(res.req.auth)) {
      return next();
    }

    // pull the configured key instead of hard‐coded 'patient'
    const id = (req[source] as any)[key] as string | undefined;
    if (!id) {
      return next(new ApiError(httpStatus.FORBIDDEN, `No user (${context})`));
    }

    const patient: User | null = await usersService.getById(id);
    if (!patient) {
      return next(
        new ApiError(
          httpStatus.FORBIDDEN,
          `User was with id ${id} not found (${context})`,
        ),
      );
    }

    const currentUser: User | null = await usersService.getUserByOwner(
      res.req.auth.sub,
      patient.organization,
    );
    if (!currentUser) {
      return next(
        new ApiError(
          httpStatus.FORBIDDEN,
          `Current user is not part of the organization as the requested user (${context})`,
        ),
      );
    }

    (req as any).currentUser = currentUser;
    next();
  };

// query and body still use the default 'patient' key
export function validateQueryUser(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  return makeValidateUser("query")(req, res, next);
}

export function validateBodyUser(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  return makeValidateUser("body")(req, res, next);
}

// params now pulls from req.params.userId
export function validateParamsUser(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  return makeValidateUser("params", "userId")(req, res, next);
}
