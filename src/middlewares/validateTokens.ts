import httpStatus from "http-status";
import type { Request, Response, NextFunction } from "express";
import ApiError from "../utils/ApiError";
import { getTokenById } from "../tokens/tokens.service";

export async function validateParamsToken(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  // assume tokenId comes from req.params
  const tokenId = req.params.tokenId as string | undefined;
  if (!tokenId) {
    return next(new ApiError(httpStatus.BAD_REQUEST, "Token ID is required"));
  }

  // fetch your token entity
  const token = await getTokenById(tokenId);
  if (!token) {
    return next(new ApiError(httpStatus.NOT_FOUND, "Token not found"));
  }

  // compare owner vs. authenticated sub
  const tokenOwner = (token as { owner?: string }).owner;
  if (!tokenOwner || tokenOwner !== res.req.auth?.sub) {
    return next(
      new ApiError(
        httpStatus.FORBIDDEN,
        "You are not allowed to access this token",
      ),
    );
  }

  // attach for downstream handlers and continue
  (req as any).token = token;
  next();
}
