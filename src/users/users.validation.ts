import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { objectId, password } from "../validations/custom.validation.js";
import {
  zPagination,
  zGet,
  zObjectId,
  zPatchBody,
  zUpdate,
  zDelete,
} from "../utils/zValidations.js";

extendZodWithOpenApi(z);

export const createUserSchema = {
  body: z.object({
    meta: z
      .record(z.any())
      .optional()
      .openapi({
        example: { key: "value" },
        description: "Additional metadata for the user",
      }),
    organization: zObjectId.openapi({
      description: "Organization ObjectId",
    }),
    email: z.string().email().optional().nullable().openapi({
      example: "user@example.com",
      description: "User email address",
    }),
    timezone: z.string().optional().openapi({
      example: "Europe/Berlin",
      description: "IANA timezone string",
    }),
    role: z.enum(["user", "admin", "patient", "onlyself"]).optional().openapi({
      description: "Role assigned to the user",
    }),
    category: z
      .enum(["doctor", "nurse", "patient", "pharmacist", "relative"])
      .optional()
      .openapi({
        description: "Category of the user",
      }),
  }),
};

export const createCurrentUserSchema = createUserSchema;

export const queryUsersSchema = {
  ...zPagination,
  query: zPagination.query.extend({
    organization: zObjectId.optional().openapi({
      description: "Filter users by organization ObjectId",
      example: "60c72b2f9b1e8d001c8e4f3a",
    }),
  }),
};

export const getUserSchema = zGet("userId");

export const getCurrentUserSchema = {
  query: z.object({
    organization: zObjectId,
  }),
};

export const updateUserSchema = {
  ...zUpdate("userId"),
  body: zPatchBody({
    password: z
      .string()
      .refine(
        (val) => {
          try {
            password(val);
            return true;
          } catch {
            return false;
          }
        },
        { message: "Invalid password format" },
      )
      .optional()
      .openapi({ description: "New user password" }),
    name: z.string().optional().openapi({ description: "User full name" }),
    timezone: z.string().optional().openapi({ description: "IANA timezone" }),
    avatar: z.string().optional().openapi({ description: "Avatar URL" }),
    meta: z
      .record(z.any())
      .optional()
      .openapi({ description: "Additional metadata" }),
    category: z
      .enum(["doctor", "nurse", "patient", "pharmacist", "relative"])
      .optional()
      .openapi({ description: "User category" }),
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
    inviteCode: z.string().optional().openapi({ description: "Invite code" }),
    organization: zObjectId
      .optional()
      .openapi({ description: "Organization ObjectId" }),
  }),
};

export const deleteUserSchema = zDelete("userId");

export const organizationInviteSchema = {
  body: z.object({
    organizationId: zObjectId.openapi({ description: "Organization ObjectId" }),
    action: z.string().optional().openapi({ description: "Invite action" }),
    role: z.string().optional().openapi({ description: "Role on invite" }),
  }),
};

export const updateInviteSchema = {
  body: z.object({
    organization: zObjectId.openapi({ description: "Organization ObjectId" }),
    status: z.enum(["accepted"]).openapi({ description: "Invite status" }),
    inviteCode: z.string().optional().openapi({ description: "Invite code" }),
  }),
};

export const organizationRemoveSchema = {
  body: z.object({
    userId: zObjectId.openapi({ description: "User ObjectId" }),
    organizationId: zObjectId.openapi({ description: "Organization ObjectId" }),
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
