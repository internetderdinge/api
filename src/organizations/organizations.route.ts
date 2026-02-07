import { Router } from "express";
import buildRouterAndDocs from "../utils/buildRouterAndDocs.js";
import {
  createOrganizationSchema,
  updateOrganizationSchema,
  getOrganizationByIdSchema,
  queryOrganizationsSchema,
} from "./organizations.validation.js";
import { organizationResponseSchema } from "./organizations.schemas.js";
import {
  createOrganization,
  getOrganizations,
  queryOrganizationsByUser,
  getOrganizationById,
  updateOrganization,
  deleteOrganization,
} from "./organizations.controller.js";
import auth from "../middlewares/auth.js";
import type { RouteSpec } from "../types/routeSpec";
import { validateAdmin } from "../middlewares/validateAdmin.js";
import { validateOrganization } from "../middlewares/validateOrganization.js";
import {
  validateOrganizationDelete,
  validateOrganizationUpdate,
} from "../middlewares/validateAction.js";
import { request } from "http";

export const organizationsRouteSpecs: RouteSpec[] = [
  {
    method: "post",
    path: "/",
    validate: [auth("manageUsers")],
    requestSchema: createOrganizationSchema,
    responseSchema: {},
    handler: createOrganization,
    summary: "Create a new organization",
    description: "Creates a new organization with the provided details.",
  },
  {
    method: "get",
    path: "/",
    validate: [auth("getUsers")],
    requestSchema: {},
    responseSchema: organizationResponseSchema.array(),
    handler: queryOrganizationsByUser,
    summary: "Get all organizations",
    description: "Retrieves all organizations accessible to the current user.",
  },
  {
    method: "get",
    path: "/all",
    validate: [auth("getUsers"), validateAdmin],
    requestSchema: queryOrganizationsSchema,
    responseSchema: organizationResponseSchema.array(),
    handler: getOrganizations,
    summary: "Get all organizations",
    description: "Retrieves all organizations in the system.",
  },
  {
    method: "get",
    path: "/:organizationId",
    validate: [auth("getUsers"), validateOrganization],
    requestSchema: getOrganizationByIdSchema,
    responseSchema: organizationResponseSchema,
    handler: getOrganizationById,
    summary: "Get an organization by ID",
    description: "Retrieves the details of a specific organization by its ID.",
  },
  {
    method: "patch",
    path: "/:organizationId",
    validate: [
      auth("manageUsers"),
      validateOrganization,
      validateOrganizationUpdate,
    ],
    requestSchema: updateOrganizationSchema,
    responseSchema: organizationResponseSchema,
    handler: updateOrganization,
    summary: "Update an organization by ID",
    description: "Updates the details of a specific organization by its ID.",
  },
  {
    method: "post",
    path: "/:organizationId",
    validate: [
      auth("manageUsers"),
      validateOrganization,
      validateOrganizationUpdate,
    ],
    requestSchema: updateOrganizationSchema,
    responseSchema: organizationResponseSchema,
    handler: updateOrganization,
    summary: "Update an organization by ID",
    description: "Updates the details of a specific organization by its ID.",
  },
  {
    method: "delete",
    path: "/:organizationId",
    validate: [
      auth("manageUsers"),
      validateOrganization,
      validateOrganizationDelete,
    ],
    requestSchema: getOrganizationByIdSchema,
    responseSchema: organizationResponseSchema,
    handler: deleteOrganization,
    summary: "Delete an organization by ID",
    description: "Deletes a specific organization by its ID.",
  },
];

const router: Router = Router();

buildRouterAndDocs(router, organizationsRouteSpecs, "/organizations", [
  "Organizations",
]);

export default router;
