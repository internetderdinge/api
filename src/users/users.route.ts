import { Router } from "express";
import buildRouterAndDocs from "../utils/buildRouterAndDocs.js";
import auth from "../middlewares/auth.js";
import validateZod from "../middlewares/validateZod.js";
import validateCurrentUser from "../middlewares/validateCurrentUser.js";
import {
  validateQueryOrganization,
  validateBodyOrganization,
  validateUser,
} from "../middlewares/validateOrganization.js";
import { validateAdmin } from "../middlewares/validateAdmin.js";
import {
  createCurrentUserSchema,
  createUserSchema,
  deleteUserSchema,
  updateUserSchema,
  getUserSchema,
  getCurrentUserSchema,
  queryUsersSchema,
  updateInviteSchema,
  validateGetInviteSchema,
  sendVerificationEmailValidationSchema,
} from "./users.validation.js";
import * as userController from "./users.controller.js";
import type { RouteSpec } from "../types/routeSpec";
import {
  createUserResponseSchema,
  getUsersResponseSchema,
  updateUserResponseSchema,
  deleteUserResponseSchema,
} from "./users.schemas.js";
import {
  validateParamsUser,
  validateQueryUser,
} from "../middlewares/validateUser.js";
import { request } from "https";

export const userRouteSpecs: RouteSpec[] = [
  {
    method: "post",
    path: "/",
    validate: [auth("manageUsers"), validateBodyOrganization],
    requestSchema: createUserSchema,
    responseSchema: createUserResponseSchema,
    handler: userController.createUser,
    summary: "Create a new user",
    description: "Creates a new user within the current organization.",
    memoOnly: true,
  },
  {
    method: "get",
    path: "/",
    validate: [auth("getUsers"), validateQueryOrganization],
    requestSchema: queryUsersSchema,
    responseSchema: getUsersResponseSchema,
    handler: userController.getUsers,
    summary: "Get a list of users",
    description:
      "Retrieves a paginated list of all users in the current organization.",
  },
  {
    method: "get",
    path: "/cleanup",
    validate: [auth("cleanup"), validateAdmin],
    handler: userController.cleanup,
    summary: "Cleanup user data",
    description: "Performs cleanup of stale or orphaned user records.",
  },
  {
    method: "post",
    path: "/current/send-verification-email",
    validate: [auth("manageUsers")],
    requestSchema: sendVerificationEmailValidationSchema,
    responseSchema: getUsersResponseSchema,
    handler: userController.sendVerificationEmail,
    summary: "Send verification email to the current user",
    description:
      "Sends a new verification email to the authenticated user’s address.",
    privateDocs: true,
  },
  {
    method: "get",
    path: "/current",
    validate: [auth("getUsers"), validateQueryOrganization],
    requestSchema: getCurrentUserSchema,
    handler: userController.getCurrentUser,
    summary: "Get the current user",
    description: "Fetches details about the currently authenticated user.",
  },
  {
    method: "post",
    path: "/current",
    validate: [auth("manageUsers")],
    requestSchema: createCurrentUserSchema,
    responseSchema: createUserResponseSchema,
    handler: userController.createCurrentUser,
    privateDocs: true,
    summary: "Create the current user",
    description: "Creates or initializes a profile for the authenticated user.",
  },
  {
    method: "get",
    path: "/invite/:inviteCode",
    validate: [auth("getUsers")],
    requestSchema: validateGetInviteSchema,
    responseSchema: getUsersResponseSchema,
    handler: userController.getInvite,
    privateDocs: true,
    summary: "Get invite details by code",
    description: "Retrieves information about a pending invite using its code.",
  },
  {
    method: "post",
    path: "/invite",
    validate: [auth("getUsers")],
    requestSchema: updateInviteSchema,
    handler: userController.updateInvite,
    privateDocs: true,
    summary: "Update invite details",
    description: "Modifies the details or status of an existing invite.",
  },
  {
    method: "get",
    path: "/:userId",
    validate: [auth("getUsers"), validateParamsUser],
    requestSchema: getUserSchema,
    responseSchema: getUsersResponseSchema,
    handler: userController.getUser,
    summary: "Get a user by ID",
    description: "Fetches a single user’s details by their unique ID.",
  },
  {
    method: "post",
    path: "/:userId",
    validate: [auth("manageUsers"), validateParamsUser],
    requestSchema: updateUserSchema,
    responseSchema: updateUserResponseSchema,
    handler: userController.updateUser,
    summary: "Update a user by ID",
    description: "Replaces a user’s full record with the provided data.",
    memoOnly: true,
  },
  {
    method: "patch",
    path: "/:userId",
    validate: [auth("manageUsers"), validateParamsUser],
    requestSchema: updateUserSchema,
    responseSchema: updateUserResponseSchema,
    handler: userController.updateUser,
    summary: "Partially update a user by ID",
    description: "Applies partial updates to a user’s record by ID.",
    memoOnly: true,
  },
  {
    method: "delete",
    path: "/:userId",
    validate: [auth("manageUsers"), validateParamsUser],
    requestSchema: deleteUserSchema,
    responseSchema: deleteUserResponseSchema,
    handler: userController.deleteUser,
    summary: "Delete a user by ID",
    description: "Removes a user from the system by their unique ID.",
  },
];

const router: Router = Router();

buildRouterAndDocs(router, userRouteSpecs, "/users", ["Users"]);

export default router;
