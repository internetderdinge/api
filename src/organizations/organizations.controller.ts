import type { Request, Response } from "express";
import httpStatus from "http-status";
import pick from "../utils/pick.js";
import ApiError from "../utils/ApiError.js";
import catchAsync from "../utils/catchAsync.js";
import usersService from "../users/users.service";
import organizationsService, {
  deleteOrganizationById,
} from "./organizations.service.js";
import mongoose from "mongoose";
import { filterOptions } from "../utils/filterOptions.js";

const ObjectId = mongoose.Types.ObjectId;

export type CreateOrganizationOwnerUserParams = {
  organization: any;
  owner: string;
  request: Request;
};

export type CreateOrganizationOwnerUserHook = (
  params: CreateOrganizationOwnerUserParams,
) => Record<string, any>;

let createOrganizationOwnerUserHook: CreateOrganizationOwnerUserHook | null =
  null;

export const setCreateOrganizationOwnerUserHook = (
  hook?: CreateOrganizationOwnerUserHook,
): void => {
  createOrganizationOwnerUserHook = hook ?? null;
};

const createOrganizationOwnerUserBody = (
  params: CreateOrganizationOwnerUserParams,
) => ({
  organization: params.organization._id,
  owner: params.owner,
  role: "admin",
  status: "accept",
  ...(createOrganizationOwnerUserHook
    ? createOrganizationOwnerUserHook(params)
    : {}),
});

export const createOrganization = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const organization = await organizationsService.createOrganization(
      req.body,
    );
    const user = await usersService.createUser(
      createOrganizationOwnerUserBody({
        organization,
        owner: res.req.auth.sub,
        request: req,
      }),
    );
    res.status(httpStatus.CREATED).send(organization);
  },
);

export const getOrganizations = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const filter = pick(req.query, ["name", "kind"]);
    const options = pick(req.query, ["sortBy", "limit", "page"]);

    const filteredOptions = filterOptions(req.query, filter, {
      objectIds: ["_id", "patient"],
      search: ["name", "kind"],
    });

    const optionsPopulate = {
      ...options,
      // fuzzySearch: req.query.search ? { search: req.query.search, fields: ['name', 'kind'] } : undefined,
      populate: "usersData,devicesData",
    };

    const result = await organizationsService.queryOrganizations(
      filteredOptions,
      optionsPopulate,
    );
    res.send(result);
  },
);

export const queryOrganizationsByUser = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const users = await usersService.getUsersByOwner(res.req.auth.sub);
    const result = await organizationsService.queryOrganizationsByUser(users);
    res.send(result);
  },
);

export const getOrganizationById = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const organization = await organizationsService.getOrganizationById(
      req.params.organizationId,
    );
    if (!organization) {
      throw new ApiError(httpStatus.NOT_FOUND, "Organization not found");
    }
    res.send(organization);
  },
);

export const updateOrganization = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const user = await organizationsService.updateOrganizationById(
      req.params.organizationId,
      req.body,
    );
    res.send(user);
  },
);

export const deleteOrganization = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const entry = await deleteOrganizationById(req.params.organizationId);
    res.send(entry);
  },
);

export default {
  createOrganization,
  getOrganizations,
  queryOrganizationsByUser,
  getOrganizationById,
  updateOrganization,
  deleteOrganization,
};
