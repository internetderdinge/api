// @ts-nocheck
import httpStatus from "http-status";
import { ObjectId } from "mongoose";
import Organization from "./organizations.model.js";
import type { IOrganization } from "./organizations.model.js";
import type { QueryResult } from "../models/plugins/paginate.plugin.js";
import ApiError from "../utils/ApiError.js";

const createOrganization = async (
  organizationBody: Partial<IOrganization>,
): Promise<IOrganization> => {
  const organization = await Organization.create(organizationBody);
  return organization;
};

const queryOrganizations = async (
  filter: Record<string, any>,
  options: {
    sortBy?: string;
    limit?: number;
    page?: number;
    populate?: string;
  },
): Promise<QueryResult<IOrganization>> => {
  const organizations = await Organization.paginate(filter, options);
  return organizations;
};

const queryOrganizationsByUser = async (
  organizationsList: Array<{ organization?: ObjectId | null }>,
): Promise<QueryResult<IOrganization> | false> => {
  if (!organizationsList) return false;
  const organizationIds = organizationsList
    .map((e) => e.organization)
    .filter((id): id is ObjectId => Boolean(id));
  const organizations = await Organization.paginate(
    {
      _id: { $in: organizationIds },
    },
    {},
  );
  return organizations;
};

export const getOrganizationById = async (
  id: ObjectId,
): Promise<IOrganization | null> => {
  return Organization.findById(id);
};

export const getOrganizationByEmail = async (
  email: string,
): Promise<IOrganization | null> => {
  return Organization.findOne({ email });
};

const updateOrganizationById = async (
  organizationId: ObjectId,
  updateBody: Partial<IOrganization>,
): Promise<IOrganization> => {
  const organization = await getOrganizationById(organizationId);
  if (!organization) {
    throw new ApiError(httpStatus.NOT_FOUND, "Organization not found");
  }

  // Legacy: Remove organization field if present in updateBody
  if ("organization" in updateBody) {
    delete updateBody.organization;
  }
  Object.assign(organization, updateBody);
  await organization.save();
  return organization;
};

export const deleteOrganizationById = async (
  organizationId: ObjectId,
): Promise<IOrganization> => {
  const organization = await getOrganizationById(organizationId);
  if (!organization) {
    throw new ApiError(httpStatus.NOT_FOUND, "Organization not found");
  }
  await organization.deleteOne();
  return organization;
};

export default {
  createOrganization,
  queryOrganizations,
  getOrganizationById,
  queryOrganizationsByUser,
  getOrganizationByEmail,
  updateOrganizationById,
  deleteOrganizationById,
};
