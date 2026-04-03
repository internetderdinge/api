import { z } from "zod";
import { zObjectId } from "../utils/zValidations.js";

export const deviceResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  serialNumber: z.string().optional(),
  status: z.enum(["online", "offline", "error"]),
  createdAt: z.string(), // ISO timestamp
  updatedAt: z.string(), // ISO timestamp
  // ...other device fields...
});

export const devicesResponseSchema = deviceResponseSchema.array();

export const eventResponseSchema = z.object({
  id: z.string(),
  deviceId: z.string(),
  type: z.string(),
  payload: z.record(z.string(), z.any()),
  timestamp: z.string(), // ISO timestamp
  // ...other event fields...
});

export const genericResponseSchema = z
  .record(z.string(), z.any())
  .openapi({ description: "Generic response payload" });

export const imageResponseSchema = z.object({
  uuid: z.string(),
  deviceId: z.string(),
  url: z.string().url(),
  metadata: z
    .object({
      width: z.number().optional(),
      height: z.number().optional(),
      size: z.number().optional(), // bytes
      // ...other metadata fields...
    })
    .optional(),
  uploadedAt: z.string(), // ISO timestamp
});

export const checkoutSessionResponseSchema = z.object({
  sessionId: z.string(),
  url: z.string().url(),
});

export const customerPortalSessionResponseSchema = z.object({
  url: z.string().url(),
});

export const subscriptionResponseSchema = z.object({
  status: z.enum(["active", "past_due", "canceled", "unpaid"]),
  currentPeriodStart: z.string(), // ISO timestamp
  currentPeriodEnd: z.string(), // ISO timestamp
  plan: z.object({
    id: z.string(),
    amount: z.number(),
    currency: z.string(),
    interval: z.enum(["day", "week", "month", "year"]),
    // ...other plan fields...
  }),
  // ...other subscription fields...
});

export const uploadResponseSchema = z
  .object({
    key: z.string().optional(),
    similarityPercentage: z.number().nullable().optional(),
    skippedUpload: z.boolean().optional(),
  })
  .openapi({ description: "Upload response payload" });

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

export const resetResponseSchema = z.object({
  message: z.string().openapi({
    example:
      "Reset all Variables and Memory and reboot Device: nrf-352656106701140",
    description: "Response message from reset operation",
  }),
  success: z.boolean().openapi({
    example: true,
    description: "Indicates if the reset operation was successful",
  }),
});
