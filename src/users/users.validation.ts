// @ts-nocheck
import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { objectId, password } from "../validations/custom.validation.js";
import {
  zPagination,
  zGet,
  zObjectId,
  zObjectIdFor,
  zPatchBody,
  zUpdate,
  zDelete,
} from "../utils/zValidations.js";

extendZodWithOpenApi(z);

export const userAppsSchema = z
  .record(z.string(), z.unknown())
  .optional()
  .openapi({ description: "Application-specific user fields" });

export const createUserBodyShape = {
  meta: z
    .object({})
    .passthrough()
    .optional()
    .openapi({
      example: { key: "value" },
      description: "Additional metadata for the user",
    }),
  apps: userAppsSchema,
  organization: zObjectId.openapi({
    description: "Organization ObjectId",
  }),
  email: z.string().email().optional().nullable().openapi({
    example: "user@example.com",
    description: "User email address",
  }),
  category: z.string().optional().openapi({
    example: "random",
    description: "LEGACY: User category",
  }),
  timezone: z.string().optional().openapi({
    example: "Europe/Berlin",
    description: "IANA timezone string",
  }),
  role: z.enum(["user", "admin", "patient", "onlyself"]).optional().openapi({
    description: "Role assigned to the user",
  }),
};

export const createUserSchema = {
  body: z.object(createUserBodyShape).openapi({
    example: {
      organization:
        process.env.SCHEMA_EXAMPLE_ORGANIZATION_ID ||
        "682fd0d7d4a6325d9d45b86e",
      email: "user@example.com",
      timezone: "Europe/Berlin",
      role: "user",
      meta: {
        externalId: "crm-123",
      },
    },
  }),
};

export const createCurrentUserSchema = createUserSchema;

export const queryUsersSchema = {
  ...zPagination,
  query: zPagination.query.extend({
    organization: zObjectIdFor("organization").openapi({
      description: "Filter users by organization ObjectId",
      example:
        process.env.SCHEMA_EXAMPLE_ORGANIZATION_ID ||
        "60c72b2f9b1e8d001c8e4f3a",
    }),
  }),
};

export const getUserSchema = zGet("userId");

export const getCurrentUserSchema = {
  query: z.object({
    organization: zObjectId.openapi({
      description: "Organization ObjectId",
      param: { name: "organization", in: "query" },
    }),
  }),
};

export const updateUserBodyShape = {
  name: z.string().optional().openapi({ description: "User full name" }),
  timezone: z.string().optional().openapi({ description: "IANA timezone" }),
  avatar: z.string().optional().openapi({ description: "Avatar URL" }),
  category: z.string().optional().openapi({
    example: "random",
    description: "LEGACY: User category",
  }),
  meta: z
    .object({})
    .passthrough()
    .optional()
    .openapi({ description: "Additional metadata" }),
  apps: userAppsSchema,
  email: z
    .string()
    .email()
    .nullable()
    .optional()
    .openapi({ description: "User email address" }),
  role: z
    .enum(["user", "admin", "patient", "onlyself"])
    .optional()
    .openapi({ description: "User role" }),
  inviteCode: z
    .string()
    .nullable()
    .optional()
    .openapi({ description: "Invite code" }),
  organization: zObjectId
    .optional()
    .openapi({ description: "Organization ObjectId" }),
};

export const updateUserSchema = {
  ...zUpdate("userId"),
  body: zPatchBody(updateUserBodyShape).openapi({
    example: {
      name: "Jane Doe",
      timezone: "Europe/Berlin",
      email: "jane.doe@example.com",
      role: "patient",
      meta: {
        carePlan: "standard",
      },
    },
  }),
};

export const deleteUserSchema = zDelete("userId");

export const organizationInviteSchema = {
  body: z
    .object({
      organizationId: zObjectId.openapi({
        description: "Organization ObjectId",
      }),
      action: z.string().optional().openapi({ description: "Invite action" }),
      role: z.string().optional().openapi({ description: "Role on invite" }),
    })
    .openapi({
      example: {
        organizationId:
          process.env.SCHEMA_EXAMPLE_ORGANIZATION_ID ||
          "682fd0d7d4a6325d9d45b86e",
        action: "accept",
        role: "user",
      },
    }),
};

export const updateInviteSchema = {
  body: z
    .object({
      organization: zObjectId.openapi({ description: "Organization ObjectId" }),
      status: z.enum(["accepted"]).openapi({ description: "Invite status" }),
      inviteCode: z
        .string()
        .nullable()
        .optional()
        .openapi({ description: "Invite code" }),
    })
    .openapi({
      example: {
        organization:
          process.env.SCHEMA_EXAMPLE_ORGANIZATION_ID ||
          "682fd0d7d4a6325d9d45b86e",
        status: "accepted",
        inviteCode: "INVITE-123",
      },
    }),
};

export const organizationRemoveSchema = {
  body: z
    .object({
      userId: zObjectId.openapi({ description: "User ObjectId" }),
      organizationId: zObjectId.openapi({
        description: "Organization ObjectId",
      }),
    })
    .openapi({
      example: {
        userId:
          process.env.SCHEMA_EXAMPLE_USER_ID || "682fd0d7d4a6325d9d45b86d",
        organizationId:
          process.env.SCHEMA_EXAMPLE_ORGANIZATION_ID ||
          "682fd0d7d4a6325d9d45b86e",
      },
    }),
};

export const updateTimesByIdSchema = {
  ...zUpdate("userId"),
  body: z
    .object({})
    .catchall(z.string())
    .openapi({
      description: "Arbitrary key/value map of intake times",
      example: {
        "intake-morning": "10:00",
        "intake-noon": "",
        "intake-afternoon": "",
        "intake-night": "15:00",
      },
    }),
};

export const updateTimesByIdSchemas = {
  // if you need a path param, uncomment and adjust:
  // ...zUpdate('timeId'),
  ...updateTimesByIdSchema,
};

export const validateGetInviteSchema = {
  params: z.object({
    inviteCode: z.string().openapi({ description: "Invite code to validate" }),
  }),
};

export const sendVerificationEmailValidationSchema = {};
