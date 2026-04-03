import { Router } from "express";
import buildRouterAndDocs from "../utils/buildRouterAndDocs";
import auth from "../middlewares/auth";
import { validateAdmin } from "../middlewares/validateAdmin";
import { validateDevice } from "../middlewares/validateDevice";
import type { RouteSpec } from "../types/routeSpec";

import {
  getEventsSchema,
  getDeviceSchema,
  getEntrySchema,
  updateEntrySchema,
  pingDeviceSchema,
  iotDevicesSchema,
  shadowAlarmValidationSchema,
  apiStatusRequestSchema,
  // add other input schemas as needed
} from "./iotdevice.validation";

import {
  iotDeviceResponseSchema,
  eventResponseSchema,
  deviceResponseSchema,
  shadowAlarmSchema,
  pingResponseSchema,
  deviceStatusSchema,
  apiStatusSchema,
  entryResponseSchema,
} from "./iotdevice.schemas";

import {
  getIotDevices,
  getEvents,
  getDevice,
  shadowAlarmGet,
  shadowAlarmUpdate,
  shadowAdmin,
  pingDevice,
  getDeviceStatus,
  getApiStatus,
  getEntry,
  updateEntry,
} from "./iotdevice.controller";
import { request } from "https";

export const iotdeviceRouteSpecs: RouteSpec[] = [
  {
    method: "get",
    path: "/",
    validate: [auth("getUsers"), validateAdmin],
    requestSchema: iotDevicesSchema,
    responseSchema: iotDeviceResponseSchema.array(),
    handler: getIotDevices,
    summary: "List all IoT devices",
    description: "Retrieves a list of all registered IoT devices.",
  },
  {
    method: "get",
    path: "/events/:deviceId",
    validate: [auth("getUsers"), validateDevice],
    requestSchema: getEventsSchema,
    responseSchema: eventResponseSchema.array(),
    handler: getEvents,
    summary: "Get events for a device",
    description: "Fetches event records for the specified device by its ID.",
  },
  {
    method: "post",
    path: "/devices",
    validate: [auth("getUsers"), validateAdmin],
    requestSchema: getDeviceSchema,
    responseSchema: deviceResponseSchema,
    handler: getDevice,
    summary: "Fetch a single device by criteria",
    description:
      "Retrieves a single IoT device matching the provided criteria.",
  },
  {
    method: "get",
    path: "/device/shadowAlarmUpdate/:deviceId",
    validate: [auth("getUsers"), validateAdmin],
    requestSchema: getEntrySchema,
    responseSchema: shadowAlarmSchema,
    handler: shadowAlarmGet,
    summary: "Get shadow alarm settings",
    description:
      "Fetches the shadow alarm configuration for a specific device.",
  },
  {
    method: "post",
    path: "/device/shadowAlarmUpdate/:deviceId",
    validate: [auth("getUsers"), validateAdmin],
    requestSchema: { body: shadowAlarmSchema },
    responseSchema: shadowAlarmSchema,
    handler: shadowAlarmUpdate,
    summary: "Update shadow alarm settings",
    description:
      "Updates the shadow alarm configuration for a specific device.",
  },
  {
    method: "get",
    path: "/shadow/:nrfId/:shadowName",
    validate: [auth("getUsers"), validateAdmin],
    requestSchema: shadowAlarmValidationSchema,
    responseSchema: shadowAlarmSchema,
    handler: shadowAdmin,
    summary: "Administer device shadow by nrfId and name",
    description:
      "Performs administrative operations on a device shadow identified by NRF ID and shadow name.",
  },
  {
    method: "post",
    path: "/ledlight/:deviceId",
    validate: [auth("getUsers"), validateAdmin],
    responseSchema: pingResponseSchema,
    handler: pingDevice,
    summary: "Ping device LED light",
    description:
      "Sends a ping to the device’s LED light to test its connectivity or response.",
  },
  {
    method: "post",
    path: "/ping/:deviceId",
    validate: [auth("getUsers"), validateAdmin],
    requestSchema: pingDeviceSchema,
    responseSchema: pingResponseSchema,
    handler: pingDevice,
    summary: "Ping device",
    description:
      "Sends a ping command to the specified device to verify its availability.",
  },
  {
    method: "get",
    path: "/getDeviceStatus/:deviceId",
    validate: [auth("getUsers"), validateAdmin],
    responseSchema: deviceStatusSchema,
    handler: getDeviceStatus,
    summary: "Get current status of a device",
    description:
      "Retrieves the current operational status of the specified device.",
  },
  {
    method: "get",
    path: "/status/:kind",
    validate: [],
    requestSchema: apiStatusRequestSchema,
    responseSchema: apiStatusSchema,
    handler: getApiStatus,
    summary: "Get API status by kind",
    description:
      "Retrieves the IoT API status information for a given status kind to monitor system health or performance. Can be accessed without authentication for monitoring purposes.",
  },
  {
    method: "get",
    path: "/:deviceId",
    validate: [auth("getUsers"), validateDevice, validateAdmin],
    requestSchema: getEntrySchema,
    responseSchema: entryResponseSchema,
    handler: getEntry,
    summary: "Get one entry for a device",
    description: "Fetches a single data entry for the specified device by ID.",
  },
  {
    method: "post",
    path: "/:deviceId",
    validate: [auth("manageUsers"), validateDevice, validateAdmin],
    requestSchema: updateEntrySchema,
    responseSchema: entryResponseSchema,
    handler: updateEntry,
    summary: "Create or replace an entry for a device",
    description: "Creates or replaces a data entry for the specified device.",
  },
  {
    method: "patch",
    path: "/:deviceId",
    validate: [auth("manageUsers"), validateDevice, validateAdmin],
    requestSchema: updateEntrySchema,
    responseSchema: entryResponseSchema,
    handler: updateEntry,
    summary: "Update an entry for a device",
    description:
      "Applies a partial update to an existing data entry for the specified device.",
  },
];

const router: Router = Router();

buildRouterAndDocs(router, iotdeviceRouteSpecs, "/iotdevice", ["IoTDevice"]);

export default router;
