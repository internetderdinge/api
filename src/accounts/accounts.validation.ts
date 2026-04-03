import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import { objectId } from "../validations/custom.validation.js";
import {
  zPagination,
  zGet,
  zObjectId,
  zPatchBody,
  zUpdate,
  zDelete,
} from "../utils/zValidations.js";

extendZodWithOpenApi(z);

export const createAccountSchema = {
  body: z.object({
    name: z
      .string()
      .openapi({ example: "Sample Entry", description: "Name of the entry" })
      .optional(),
    medication: zObjectId.openapi({ description: "Medication ObjectId" }),
    organization: zObjectId.openapi({ description: "Organization ObjectId" }),
    patient: zObjectId.openapi({ description: "Patient ObjectId" }),
    meta: z
      .record(z.string(), z.any())
      .openapi({
        example: { key: "value" },
        description: "Additional metadata for the entry",
      })
      .optional(),
  }),
};

export const getUsersSchema = zPagination;

export const getAccountSchema = {
  params: z.object({
    accountId: z.string().openapi({
      example:
        process.env.SCHEMA_EXAMPLE_ACCOUNT_ID || "auth0|60452f4c0dc85b0062326",
      description: "Auth Account ID",
    }),
  }),
};

export const updateAccountSchema = {
  params: z.object({
    accountId: z.string().openapi({
      example:
        process.env.SCHEMA_EXAMPLE_ACCOUNT_ID || "auth0|60452f4c0dc85b0062326",
      description: "Auth Account ID",
    }),
  }),
  body: zPatchBody({
    language: z
      .string()
      .nullable()
      .optional()
      .openapi({ example: "en", description: "Language code" }),
    gender: z
      .string()
      .nullable()
      .optional()
      .openapi({ example: "female", description: "Gender" }),
    email: z
      .preprocess(
        (value) => (value === "" ? undefined : value),
        z.string().email().optional(),
      )
      .openapi({ description: "User email address" }),
    given_name: z
      .string()
      .optional()
      .openapi({ example: "John", description: "Given name" }),
    family_name: z
      .string()
      .optional()
      .openapi({ example: "Doe", description: "Family name" }),
    debug: z.boolean().optional(),
    demo: z.boolean().optional(),
    notification: z
      .record(z.string(), z.any())
      .optional()
      .openapi({ description: "Notification settings object" }),
  }),
};

export const deleteEntrySchema = {
  params: z.object({
    accountId: z.string().openapi({
      example:
        process.env.SCHEMA_EXAMPLE_ACCOUNT_ID || "auth0|60452f4c0dc85b0062326",
      description: "Auth Account ID",
    }),
  }),
};

export const currentAccountSchema = {};

export const currentAccountMfaEnrollSchema = {
  /* body: z.object({
    mfaEnroll: z.string().openapi({ example: 'totp', description: 'MFA token to enroll' }),
  }), */
};

export const setDeviceTokenSchema = {
  body: z.object({
    token: z
      .string()
      .openapi({ example: "device-token", description: "Device token to set" }),
  }),
};

export const getAvatarSchema = {};

export const deleteCurrentSchema = {};
