import { Router } from "express";
import buildRouterAndDocs, {
  type RouteSpec,
} from "../utils/buildRouterAndDocs.js";
import auth from "../middlewares/auth.js";
import { validateAdminOrSupport } from "../middlewares/validateAdminOrSupport.js";
import {
  getDevices,
  getIotDevices,
  getStats,
  searchAdmin,
} from "./adminSearch.controller.js";
import {
  adminDevicesSchema,
  adminIotDevicesSchema,
  adminSearchSchema,
  adminStatsSchema,
} from "./adminSearch.validation.js";
import {
  adminDevicesResponseSchema,
  adminIotDevicesResponseSchema,
  adminSearchResponseSchema,
  adminStatsResponseSchema,
} from "./adminSearch.schemas.js";

export const adminSearchRouteSpecs: RouteSpec[] = [
  {
    method: "get",
    path: "/stats",
    validate: [auth("getUsers"), validateAdminOrSupport],
    requestSchema: adminStatsSchema,
    responseSchema: adminStatsResponseSchema,
    handler: getStats,
    privateDocs: true,
    summary: "Get admin stats",
    description: "Returns total counts for organizations, users, and devices.",
  },
  {
    method: "get",
    path: "/search",
    validate: [auth("getUsers"), validateAdminOrSupport],
    requestSchema: adminSearchSchema,
    responseSchema: adminSearchResponseSchema,
    handler: searchAdmin,
    summary: "Search organizations, users, and devices",
    privateDocs: true,
    description:
      "Performs an admin-only global search over organizations, users, and devices.",
  },
  {
    method: "get",
    path: "/iotDevices",
    validate: [auth("getUsers"), validateAdminOrSupport],
    requestSchema: adminIotDevicesSchema,
    responseSchema: adminIotDevicesResponseSchema,
    handler: getIotDevices,
    privateDocs: true,
    summary: "List IoT devices",
    description:
      "Returns the IoT device status list used for admin device/order sync workflows.",
  },
  {
    method: "get",
    path: "/devices",
    validate: [auth("getUsers"), validateAdminOrSupport],
    requestSchema: adminDevicesSchema,
    responseSchema: adminDevicesResponseSchema,
    handler: getDevices,
    privateDocs: true,
    summary: "List MongoDB devices",
    description:
      "Returns all device documents from MongoDB for admin sync workflows.",
  },
];

const router: Router = Router();
buildRouterAndDocs(router, adminSearchRouteSpecs, "/admin", ["Admin"]);

export default router;
