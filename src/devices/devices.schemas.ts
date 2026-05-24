import { z } from "zod";
import { zObjectId } from "../utils/zValidations.js";

export const deviceResponseSchema = z.object({
  id: z.string().openapi({ example: "682fd0d7d4a6325d9d45b86f" }),
  name: z.string().openapi({ example: "Kitchen Display" }),
  serialNumber: z.string().optional().openapi({ example: "nrf-352656106701140" }),
  status: z.enum(["online", "offline", "error"]).openapi({ example: "online" }),
  createdAt: z
    .string()
    .datetime()
    .openapi({ example: "2026-05-21T09:30:00.000Z" }),
  updatedAt: z
    .string()
    .datetime()
    .openapi({ example: "2026-05-21T10:15:00.000Z" }),
}).openapi({
  example: {
    id: "682fd0d7d4a6325d9d45b86f",
    name: "Kitchen Display",
    serialNumber: "nrf-352656106701140",
    status: "online",
    createdAt: "2026-05-21T09:30:00.000Z",
    updatedAt: "2026-05-21T10:15:00.000Z",
  },
});

export const devicesResponseSchema = deviceResponseSchema.array();

export const eventResponseSchema = z.object({
  id: z.string().openapi({ example: "evt_01HX0000000000000000000000" }),
  deviceId: z.string().openapi({ example: "682fd0d7d4a6325d9d45b86f" }),
  type: z.string().openapi({ example: "state" }),
  payload: z
    .record(z.string(), z.any())
    .openapi({ example: { battery: 87, online: true } }),
  timestamp: z
    .string()
    .datetime()
    .openapi({ example: "2026-05-21T10:15:00.000Z" }),
}).openapi({
  example: {
    id: "evt_01HX0000000000000000000000",
    deviceId: "682fd0d7d4a6325d9d45b86f",
    type: "state",
    payload: {
      battery: 87,
      online: true,
    },
    timestamp: "2026-05-21T10:15:00.000Z",
  },
});

export const genericResponseSchema = z
  .record(z.string(), z.any())
  .openapi({
    description: "Generic response payload",
    example: {
      success: true,
      message: "Operation completed successfully",
    },
  });

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
}).openapi({
  example: {
    message:
      "Reset all Variables and Memory and reboot Device: nrf-352656106701140",
    success: true,
  },
});
