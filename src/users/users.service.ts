import httpStatus from "http-status";
import type { FilterQuery, PaginateOptions } from "mongoose";
import { User } from "./users.model.js";
import type { IUser, IUserDocument, IUserModel } from "./users.model.js";
import ApiError from "../utils/ApiError.js";
import auth0Service from "../accounts/auth0.service";
import organizationsService from "../organizations/organizations.service";
import { sendEmail } from "../email/email.service";
import i18n from "../i18n/i18n";

export type UpdateTimesByIdHook = (
  userId: string,
  updateBody: any,
  dryRun?: boolean,
) => Promise<any>;

let updateTimesByIdHook: UpdateTimesByIdHook | null = null;

export const setUpdateTimesByIdHook = (hook?: UpdateTimesByIdHook): void => {
  updateTimesByIdHook = hook ?? null;
};

/**
 * Create a new user
 */
export const createUser = async (
  userBody: Partial<IUser>,
): Promise<IUserDocument> => {
  return User.create(userBody);
};

/**
 * Create the “current” user (alias of createUser)
 */
export const createCurrentUser = async (
  userBody: Partial<IUser>,
): Promise<IUserDocument> => {
  return createUser(userBody);
};

/**
 * Populate a single Auth0 user
 */
const populateAuth0User = async (
  user: IUserDocument | null,
): Promise<any | undefined> => {
  if (!user) return undefined;
  const auth0users = await auth0Service.getUsersByIds([user.owner]);

  return auth0users?.data?.find((u) => u.user_id === user.owner);
};

/**
 * Populate many Auth0 users
 */
const populateAuth0Users = async (data: IUserDocument[]): Promise<any[]> => {
  const owners = data.map((u) => u.owner);
  const auth0users = await auth0Service.getUsersByIds(owners);
  if (!auth0users) return data;
  return data.map((doc) => ({
    ...doc.toJSON(),
    auth0User: auth0users?.data?.find((u) => u.user_id === doc.owner),
  }));
};

/**
 * Query for users with pagination + Auth0 enrichment
 */
export const queryUsers = async (
  filter: FilterQuery<IUser>,
  options: PaginateOptions,
): Promise<{
  results: any[];
  page: number;
  totalPages: number;
  totalResults: number;
}> => {
  const result = await (User as IUserModel).paginate(filter, options);
  result.results = await populateAuth0Users(result.results as IUserDocument[]);
  return result;
};

/**
 * Get user by Mongo _id
 */
export const getById = async (id: string): Promise<IUserDocument | null> => {
  return User.findById(id);
};

/**
 * Get user by _id with Auth0 info
 */
export const getByIdWithAuth0 = async (id: string): Promise<any | null> => {
  const user = await getById(id);
  if (!user) return null;
  const auth0User = await populateAuth0User(user);
  const json = user.toJSON();
  json.auth0User = auth0User;
  return json;
};

/**
 * Get all users in a given category (and optional organization)
 */
export const getUsersByCategory = async (
  category: string,
  organization?: string,
): Promise<IUserDocument[]> => {
  const filter: any = { category };
  if (organization) filter.organization = organization;
  return User.find(filter);
};

/**
 * Get all users for an organization
 */
export const getUsersByOrganization = async (
  organization: string,
): Promise<IUserDocument[]> => {
  return User.find({ organization }).lean();
};

/**
 * Get one user by organization + userId
 */
export const getUsersByOrganizationAndId = async (
  organization: string,
  userId: string,
): Promise<IUserDocument | null> => {
  return User.findOne({ organization, _id: userId }).lean();
};

/**
 * Get all users for a given owner
 */
export const getUsersByOwner = async (
  owner: string,
): Promise<IUserDocument[]> => {
  return User.find({ owner });
};

/**
 * Get single user by owner + organization, with Auth0 info
 */
export const getUserByOwner = async (
  owner: string,
  organization: string,
): Promise<any | null> => {
  const user = await User.findOne({ owner, organization });
  if (!user) return null;
  const auth0User = await populateAuth0User(user);
  const json = user.toJSON();
  json.auth0User = auth0User;
  return json;
};

/**
 * Get user by email
 */
export const getUserByEmail = async (
  email: string,
): Promise<IUserDocument | null> => {
  return User.findOne({ email });
};

/**
 * Send an invite email
 */
export const sendInviteEmail = async (params: {
  auth: { sub: string };
  user: IUserDocument;
  inviteCode: string;
  email: string;
}): Promise<void> => {
  const { auth, user, inviteCode, email } = params;
  const organization = await organizationsService.getOrganizationById(
    user.organization,
  );
  const auth0User = await auth0Service.getUserById(auth.sub);
  const lng = auth0User.data?.app_metadata?.language as string | "en";

  const title = `${i18n.t("Invite to ", { lng })}${
    organization.kind === "private-wirewire" ? "paperlesspaper" : "ANABOX smart"
  }`;
  const body = i18n.t(
    "You have been invited to join the group. Click on the link to accept the invitation.",
    { lng },
  );

  await sendEmail({
    title,
    body,
    url: `/${user.organization}/invite/${inviteCode}`,
    actionButtonText: "Accept invite",
    domain: organization.kind === "private-wirewire" ? "web" : "memo",
    email,
  });
};

/**
 * Update a user by ID
 */
export const updateUserById = async (
  userId: string,
  updateBody: Partial<IUser> & { meta?: Record<string, any> },
  auth: { sub: string },
): Promise<IUserDocument> => {
  const user = await getById(userId);

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, `User not found: ${userId}`);
  }

  if (user.status === "invited") {
    await sendInviteEmail({
      auth,
      user,
      inviteCode: user.inviteCode!,
      email: updateBody.email!,
    });
  }
  //TODO: restrict fields that can be updated, temporarily excluding role
  const { role, ...updateBodyRest } = updateBody;
  const meta = { ...user.meta, ...updateBodyRest.meta };
  Object.assign(user, { ...updateBodyRest, meta });
  await user.save();
  return user;
};

/**
 * Delete a user by ID
 */
export const deleteUserById = async (
  userId: string,
): Promise<IUserDocument> => {
  const user = await getById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, `User not found: ${userId}`);
  }
  if (user.role === "admin") {
    const admins = await User.find({
      organization: user.organization,
      role: "admin",
    });
    if (admins.length < 2) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "At least one admin is required",
      );
    }
  }
  await user.deleteOne();
  return user;
};

/**
 * (Misnamed) delete a user’s image by ID
 */
export const userImageById = async (userId: string): Promise<IUserDocument> => {
  const user = await getById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, `User not found: ${userId}`);
  }
  await user.deleteOne();
  return user;
};

/**
 * Invite a user to an organization
 */
export const organizationInvite = async (
  body: { organizationId: string; role: string },
  oldUser: { id: string },
  status = "invited",
): Promise<IUserDocument> => {
  const user = await getById(oldUser.id);
  if (!user) throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  if (user.organizations.some((o) => o.id.equals(body.organizationId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invite already exists");
  }
  user.organizations.push({ id: body.organizationId, role: body.role, status });
  await user.save();
  return user;
};

/**
 * Get an invite by code
 */
export const getInvite = async (params: {
  inviteCode: string;
}): Promise<IUserDocument | null> => {
  return User.findOne({
    inviteCode: params.inviteCode,
    owner: { $exists: false },
  }).populate("organizationData");
};

/**
 * Accept or decline an invite
 */
export const updateInvite = async (params: {
  inviteCode: string;
  status: string;
  owner: string;
}): Promise<IUserDocument> => {
  const user = await User.findOne({
    inviteCode: params.inviteCode,
    owner: { $exists: false },
  });
  if (!user) throw new ApiError(httpStatus.NOT_FOUND, "Invite not found");
  user.status = params.status;
  user.owner = params.owner;
  user.inviteCode = null;
  await user.save();
  return user;
};

/**
 * Remove a user from an organization
 */
export const organizationRemove = async (body: {
  userId: string;
  organizationId: string;
}): Promise<IUserDocument> => {
  const user = await getById(body.userId);
  if (!user) throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  user.organizations = user.organizations.filter(
    (o) => !o.id.equals(body.organizationId),
  );
  await user.save();
  return user;
};

/**
 * Fetch up to 100k users with organization populated
 */
export const queryAllCalendars = async (): Promise<IUserDocument[]> => {
  return User.find({}, null, { limit: 100000 }).populate("organizationData");
};

/**
 * Delete many users by ID list
 */
export const deleteMany = async (
  idList: string[],
): Promise<{ deletedCount?: number }> => {
  return User.deleteMany({ _id: { $in: idList } });
};

/**
 * Update times for a user by ID (hooked from memo-api)
 */
export const updateTimesById = async (
  userId: string,
  updateBody: any,
  dryRun = true,
): Promise<any> => {
  if (!updateTimesByIdHook) {
    throw new ApiError(
      httpStatus.NOT_IMPLEMENTED,
      "updateTimesById not configured",
    );
  }
  return updateTimesByIdHook(userId, updateBody, dryRun);
};

export default {
  createUser,
  createCurrentUser,
  getById,
  getByIdWithAuth0,
  getUsersByCategory,
  getUsersByOrganization,
  getUsersByOrganizationAndId,
  getUsersByOwner,
  getUserByEmail,
  getUserByOwner,
  sendInviteEmail,
  updateUserById,
  updateTimesById,
  deleteUserById,
  userImageById,
  organizationInvite,
  getInvite,
  updateInvite,
  organizationRemove,
  queryUsers,
  queryAllCalendars,
  deleteMany,
  sendEmail,
  populateAuth0User,
  populateAuth0Users,
};
