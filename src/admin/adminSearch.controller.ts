import type { Request, Response } from "express";
import httpStatus from "http-status";
import { ApiError } from "../utils/ApiError.js";
import catchAsync from "../utils/catchAsync.js";
import {
  getAdminDevices,
  getAdminIotDevices,
  getAdminStats,
  searchAdminCollections,
} from "./adminSearch.service.js";

type AuthRequest = Request & {
  auth?: Record<string, unknown>;
};

const readListQuery = (
  req: Request,
): {
  page: number;
  perPage: number;
  updatedSince: string | null;
} => {
  const rawPage = Number(req.query.page);
  const rawPerPage = Number(req.query.perPage);
  const updatedSince = String(req.query.updatedSince ?? "").trim() || null;

  return {
    page: Number.isFinite(rawPage) ? Math.max(1, Math.floor(rawPage)) : 1,
    perPage: Number.isFinite(rawPerPage)
      ? Math.max(1, Math.min(500, Math.floor(rawPerPage)))
      : 100,
    updatedSince,
  };
};

export const searchAdmin = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const search = String(req.query.search || "").trim();
    const rawLimit = Number(req.query.limit);
    const limit = Number.isFinite(rawLimit)
      ? Math.max(1, Math.min(50, Math.floor(rawLimit)))
      : 12;

    const result = await searchAdminCollections({ search, limit });
    res.send(result);
  },
);

export const getStats = catchAsync(async (req: AuthRequest, res: Response) => {
  const result = await getAdminStats();
  res.send(result);
});

export const getIotDevices = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const result = await getAdminIotDevices(readListQuery(req));
    res.send(result);
  },
);

export const getDevices = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const result = await getAdminDevices(readListQuery(req));
    res.send(result);
  },
);
