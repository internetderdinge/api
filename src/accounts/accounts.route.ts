import { Router } from "express";
import buildRouterAndDocs from "../utils/buildRouterAndDocs.js";
import auth from "../middlewares/auth.js";
import { validateOrganization } from "../middlewares/validateOrganization.js";
import validateCurrentUser from "../middlewares/validateCurrentUser.js";
import type { RouteSpec } from "../types/routeSpec";
import * as accountsValidation from "./accounts.validation.js";
import * as accountsController from "./accounts.controller.js";
import { accountResponseSchema } from "./accounts.schemas.js";
import { validateParamsAccount } from "../middlewares/validateCurrentAuthUser.js";

export const accountsRouteSpecs: RouteSpec[] = [
  {
    method: "get",
    path: "/current",
    validate: [auth("manageUsers")],
    requestSchema: accountsValidation.currentAccountSchema,
    responseSchema: accountResponseSchema,
    privateDocs: true,
    handler: accountsController.current,
    summary: "Get the current account",
  },
  {
    method: "post",
    path: "/current/mfa/enroll",
    validate: [auth("manageUsers")],
    requestSchema: accountsValidation.currentAccountMfaEnrollSchema,
    responseSchema: accountResponseSchema,
    privateDocs: true,
    handler: accountsController.mfaEnroll,
    summary: "Enroll current account in MFA",
  },
  {
    method: "post",
    path: "/current/mfa/disable",
    validate: [auth("manageUsers")],
    requestSchema: accountsValidation.currentAccountMfaEnrollSchema,
    responseSchema: accountResponseSchema,
    privateDocs: true,
    handler: accountsController.mfaDisable,
    summary: "Disable current account MFA",
  },
  {
    method: "post",
    path: "/:accountId/setDeviceToken",
    validate: [auth("manageUsers"), validateParamsAccount],
    requestSchema: accountsValidation.setDeviceTokenSchema,
    responseSchema: accountResponseSchema,
    privateDocs: true,
    handler: accountsController.setDeviceToken,
    summary: "Set a device token for an account",
  },
  {
    method: "get",
    path: "/:accountId/avatar.jpg",
    validate: [auth("manageUsers")],
    requestSchema: accountsValidation.getAvatarSchema,
    responseSchema: accountResponseSchema, // or a binary/blob schema if you have one
    privateDocs: true,
    handler: accountsController.avatar,
    summary: "Fetch account avatar",
  },
  {
    method: "delete",
    path: "/deleteCurrent",
    validate: [auth("manageUsers")],
    requestSchema: accountsValidation.deleteCurrentSchema,
    responseSchema: accountResponseSchema,
    privateDocs: true,
    handler: accountsController.deleteCurrent,
    summary: "Delete the current account",
  },
  {
    method: "get",
    path: "/:accountId",
    validate: [auth("getUsers"), validateParamsAccount],
    requestSchema: accountsValidation.getAccountSchema,
    responseSchema: accountResponseSchema,
    handler: accountsController.getAccountById,
    summary: "Get an account by ID",
  },
  {
    method: "post",
    path: "/:accountId",
    validate: [auth("manageUsers"), validateParamsAccount],
    requestSchema: accountsValidation.updateAccountSchema,
    responseSchema: accountResponseSchema,
    privateDocs: true,
    handler: accountsController.updateEntry,
    summary: "Create or replace an account by ID",
  },
  {
    method: "patch",
    path: "/:accountId",
    validate: [auth("manageUsers"), validateParamsAccount],
    requestSchema: accountsValidation.updateAccountSchema,
    responseSchema: accountResponseSchema,
    privateDocs: true,
    handler: accountsController.updateEntry,
    summary: "Update fields on an account by ID",
  },
];

const router: Router = Router();
buildRouterAndDocs(router, accountsRouteSpecs, "/accounts", ["Accounts"]);

export default router;
