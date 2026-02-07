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
  body: z.object({
    /*  name: z.string().openapi({
      example: 'Acme Inc.',
      description: 'The name of the organization',
    }),
    email: z.string().email().openapi({
      example: 'contact@acme.com',
      description: 'Contact email for the organization',
    }), */
    kind: z.string().openapi({
      example: "private",
      description: "The type or category of the organization",
    }),
  }),
};

export const queryOrganizationsSchema = zPagination;

export const getOrganizationByIdSchema = zGet("organizationId");

export const updateOrganizationSchema = {
  ...zUpdate("organizationId"),
  body: z.object({
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
      .record(z.any())
      .openapi({
        example: { key: "value" },
        description: "Additional metadata for the entry",
      })
      .optional(),
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
