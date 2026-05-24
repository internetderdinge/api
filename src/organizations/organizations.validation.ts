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

export const createOrganizationSchema = {
  body: z
    .object({
      kind: z.string().openapi({
        example: "private",
        description: "The type or category of the organization",
      }),
    })
    .openapi({
      example: {
        kind: "private",
      },
    }),
};

export const queryOrganizationsSchema = zPagination;

export const getOrganizationByIdSchema = zGet("organizationId");

export const updateOrganizationSchema = {
  ...zUpdate("organizationId"),
  body: z
    .object({
      name: z
        .string()
        .openapi({
          example: "Acme Inc.",
          description: "The name of the organization",
        })
        .optional(),
      organization: zObjectId, // Legacy field, to be removed later
      kind: z
        .string()
        .openapi({
          example: "private",
          description: "The type or category of the organization",
        })
        .optional(),
      meta: z
        .record(z.string(), z.any())
        .openapi({
          example: { billingId: "cus_123", region: "eu" },
          description: "Additional metadata for the entry",
        })
        .optional(),
    })
    .openapi({
      example: {
        name: "Acme Inc.",
        organization:
          process.env.SCHEMA_EXAMPLE_ORGANIZATION_ID ||
          "682fd0d7d4a6325d9d45b86d",
        kind: "private",
        meta: {
          billingId: "cus_123",
          region: "eu",
        },
      },
    }),
  //...zUpdate('organizationId'),
  /* body: z.object({
    meta: z.any,
    /* organization: zObjectId,
    kind: z
      .string()
      .openapi({
        example: 'private',
        description: 'The type or category of the organization',
      })
      .optional(),
  }),*/
};

export const deleteOrganizationSchema = zDelete("organizationId");
