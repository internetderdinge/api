import httpStatus from "http-status";
import ApiError from "../utils/ApiError"; // keep .cjs import
import type { Request, Response, NextFunction } from "express";

interface User {
  "https://memo.wirewire.de/roles"?: string[];
}

// you can adjust the User source if your auth payload differs
export const isAiRole = (user?: User): boolean => {
  if (!user) return false;

  console.log("Checking AI role for user:", user);
  return user["https://memo.wirewire.de/roles"]?.includes("ai") ?? false;
};

export const validateAiRole = async (
  req: Request & { auth?: User },
  res: Response,
  next: NextFunction,
): Promise<void> => {
  // assuming the auth payload is attached to req.auth

  console.log("Validating AI role for user:", req.auth);
  if (isAiRole(req.auth)) {
    return next();
  }
  return next(
    new ApiError(
      httpStatus.FORBIDDEN,
      "User is not part of the ai group (validateAi)",
    ),
  );
};
