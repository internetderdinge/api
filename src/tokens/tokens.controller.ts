import httpStatus from "http-status";
import type { Request, Response, NextFunction } from "express";
import * as tokensService from "./tokens.service.js";
import pick from "../utils/pick.js";

export const getTokens = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const filter = pick({ ...req.query, owner: res.req.auth.sub }, [
    "name",
    "role",
    "owner",
  ]);
  const options = pick(req.query, ["sortBy", "limit", "page"]);
  const result = await tokensService.queryTokens(filter, options);
  res.send(result);
};

// Create a new token
export const createToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const tokenData = {
      ...req.body,
      owner: res.req.auth.sub, // Always set owner from authenticated user
    };
    const token = await tokensService.createToken(tokenData);
    res.status(httpStatus.CREATED).send(token);
  } catch (error) {
    next(error);
  }
};

// Get a token by ID
export const getToken = async (
  req: Request<{ tokenId: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const token = await tokensService.getTokenById(req.params.tokenId);
    if (!token) {
      res.status(httpStatus.NOT_FOUND).send({ message: "Token not found" });
      return;
    }
    res.send(token);
  } catch (error) {
    next(error);
  }
};

// Delete a token by ID
export const deleteToken = async (
  req: Request<{ tokenId: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const token = await tokensService.deleteTokenById(req.params.tokenId);
    if (!token) {
      res.status(httpStatus.NOT_FOUND).send({ message: "Token not found" });
      return;
    }
    res.status(httpStatus.NO_CONTENT).send();
  } catch (error) {
    next(error);
  }
};

export default {
  createToken,
  getToken,
  deleteToken,
};
