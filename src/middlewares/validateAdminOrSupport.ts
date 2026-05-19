import httpStatus from "http-status";
import ApiError from "../utils/ApiError";
import type { Request, Response, NextFunction } from "express";

const ROLES_CLAIM = "https://memo.wirewire.de/roles";

const isAdminOrSupport = (user: Record<string, any> | undefined): boolean => {
  if (!user) return false;

  const roles = user[ROLES_CLAIM];

  return Array.isArray(roles)
    ? roles.includes("admin") || roles.includes("support")
    : false;
};

const validateAdminOrSupport = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  if (isAdminOrSupport(req.auth)) {
    next();
  } else {
    next(
      new ApiError(
        httpStatus.FORBIDDEN,
        "User is not part of the admin or support group (validateAdminOrSupport)",
      ),
    );
  }
};

export { isAdminOrSupport, validateAdminOrSupport };
