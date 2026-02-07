import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import { objectId } from "../validations/custom.validation.js";
import {
  zGet,
  zObjectId,
  zPatchBody,
  zUpdate,
  zDelete,
  zPagination,
} from "../utils/zValidations.js";
import { enable } from "agenda/dist/job/enable";

extendZodWithOpenApi(z);

export const createEntrySchema = {
  body: z
    .object({
      name: z.string().optional(),
      deviceId: z.string().optional(),
      kind: z.string().optional(),
      meta: z.record(z.any()).optional(),
      organization: zObjectId,
      patient: zObjectId.optional(),
      paper: zObjectId.optional().nullable(),
      date: z.string().datetime().optional(),
    })
    .openapi({ description: "Create a new device entry" }),
};

export const getUsersSchema = {
  query: z
    .object({
      name: z.string().optional(),
      role: z.string().optional(),
      sortBy: z.string().optional(),
      limit: z.number().int().optional(),
      page: z.number().int().optional(),
    })
    .openapi({ description: "Query users" }),
};

export const getEntrySchema = zGet("deviceId");

export const updateEntrySchema = {
  ...zUpdate("deviceId"),
  body: zPatchBody({
    name: z.string().optional(),
    kind: z.string().optional(),
    deviceId: z.string().optional(),
    organization: zObjectId.optional(),
    patient: zObjectId.optional().nullable(),
    paper: zObjectId.optional().nullable(),
    meta: z.record(z.any()).optional(),
    iotDevice: z.record(z.any()).optional(),
    shadow: z.union([z.string(), z.number()]).optional(),
    alarmEnable: z.number().int().optional(),
    takeOffsetTime: z.number().int().optional(),
    updatedAt: z.string().datetime().optional(),
    createdAt: z.string().datetime().optional(),
    payment: z.record(z.any()).optional(),
    lut: z.string().optional(),
    sleepTime: z.string().optional(),
    clearScreen: z.boolean().optional(),
  }).openapi({ description: "Fields to update on a device entry" }),
};

export const getEventsSchema = {
  query: z
    .object({
      DateStart: z.string(),
      DateEnd: z.string(),
      TypeFilter: z.string().optional(),
    })
    .openapi({ description: "Fetch device events in a time range" }),
};

export const deleteEntrySchema = zDelete("deviceId");

export const createCheckoutSessionSchema = {};
export const createCustomerPortalSessionSchema = {
  params: z.object({
    deviceId: zObjectId.openapi({ description: "Device ObjectId" }),
  }),
  body: z.object({
    domain: z.string().url().openapi({
      description: "Domain for return URL",
      example: "https://web.wirewire.de",
    }),
  }),
};
export const createDeviceSchema = {
  body: z.object({
    kind: z.string().optional(),
    patient: zObjectId.optional().nullable(),
    paper: zObjectId.optional().nullable(),
    organization: zObjectId.openapi({ description: "Organization ObjectId" }),
  }),
};
export const deleteDeviceSchema = zDelete("deviceId");
export const getDeviceSchema = zGet("deviceId");
export const getImageSchema = zGet("deviceId");
export const ledLightSchema = {
  params: z.object({
    deviceId: zObjectId.openapi({ description: "Device ObjectId" }),
  }),
  body: z
    .object({
      led: z.array(z.tuple([z.number().int(), z.number().int()])),
      timeout: z.number().int(),
    })
    .openapi({
      description: "LED light configuration for device",
      example: {
        led: [
          [0, 0],
          [1, 0],
          [2, 0],
          [3, 0],
          [4, 0],
          [5, 0],
          [6, 0],
          [7, 0],
          [8, 0],
          [9, 0],
          [10, 0],
          [11, 0],
          [12, 0],
          [13, 0],
          [14, 0],
          [15, 100],
          [16, 100],
          [17, 100],
          [18, 100],
          [19, 100],
          [20, 100],
          [21, 100],
          [22, 0],
          [23, 0],
          [24, 0],
          [25, 0],
          [26, 0],
          [27, 0],
          [28, 0],
        ],
        timeout: 40,
      },
    }),
};
export const pingDeviceSchema = {
  params: z.object({
    deviceId: zObjectId.openapi({ description: "Device ObjectId" }),
  }),
  query: z.object({
    dataResponse: z
      .string()
      .openapi({ description: "Data response", example: "false" }),
  }),
};

export const resetDeviceSchema = {
  params: z.object({
    deviceId: zObjectId.openapi({ description: "Device ObjectId" }),
  }),
};

export const rebootDeviceSchema = zGet("deviceId");

export const registerDeviceSchema = {
  ...zPagination,
  body: z.object({
    enable: z.boolean(),
    organization: zObjectId,
    patient: zObjectId.optional().nullable(),
    paper: zObjectId.optional().nullable(),
  }),
  params: z.object({
    deviceId: z.string(),
  }),
  query: zPagination.query.extend({
    patient: zObjectId.optional(),
    organization: zObjectId.optional(),
  }),
};

export const queryDevicesSchema = {
  ...zPagination,
  query: zPagination.query.extend({
    patient: zObjectId.optional(),
    organization: zObjectId.optional(),
  }),
};
export const subscriptionSchema = {
  params: z.object({
    deviceId: zObjectId.openapi({ description: "Device ObjectId" }),
  }),
};
export const uploadSingleImageFromWebsiteSchema = {};
export const updateDeviceSchema = {
  ...zUpdate("deviceId"),
  body: zPatchBody({
    intake: z.record(z.any()).optional(),
    meta: z.record(z.any()).optional(),
    organization: zObjectId.optional(),
    patient: zObjectId.optional().nullable(),
    paper: zObjectId.optional().nullable(),
    kind: z.string().optional(),
    deviceId: z.string().optional(),
    alarmEnable: z.number().int().optional(),
    takeOffsetTime: z.number().int().optional(),
    iotDevice: z.record(z.any()).optional(),
    payment: z.record(z.any()).optional(),
  }),
};

export const updateSingleImageMetaSchema = {};
export const uploadSingleImageSchema = {
  body: z.object({
    file: z.instanceof(File).openapi({ description: "File to upload" }),
  }),
};
