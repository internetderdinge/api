import { z } from 'zod';
import { objectId } from '../validations/custom.validation';
import mongoose from 'mongoose';

export const zPagination = {
  query: z.object({
    name: z.string().optional(),
    role: z.string().openapi({ example: 'admin', description: 'Role to filter by' }).optional(),
    sortBy: z.string().openapi({ example: 'createdAt', description: 'Field to sort by' }).optional(),
    search: z
      .string()
      .openapi({
        example: 'search term',
        description: 'Search term to filter results',
      })
      .optional(),
    limit: z.coerce
      .number()
      .openapi({
        example: 10,
        description: 'Number of items per page',
      })
      .int()
      .min(1)
      .max(100000)
      .optional(),
    offset: z
      .number() // was z.int()
      .openapi({
        example: 0,
        description: 'Offset for pagination, used to skip a number of items',
      })
      .int()
      .min(0)
      .max(100000)
      .optional(),
    page: z
      .number()
      .int()
      .openapi({
        example: 1,
        description: 'Page number for pagination',
      })
      .min(1)
      .max(100000)
      .optional(),
  }),
};

export const zPaginationResponse = () =>
  z.object({
    results: z.array(z.unknown()), // Replace with your specific item schema
    totalResults: z.number().openapi({ example: 100, description: 'Total number of items' }),
    totalPages: z.number().openapi({ example: 10, description: 'Total number of pages' }),
    page: z.number().openapi({ example: 1, description: 'Current page number' }),
    limit: z.number().openapi({ example: 10, description: 'Number of items per page' }),
  });

export const zGet = (id: string) => ({
  params: z.object({
    [id]: zObjectId /* .openapi({ example: '682fd0d7d4a6325d9d45b86d' }) */,
  }),
});

export function zPatchBody<T extends ZodRawShape>(shape: T, message = 'At least one field must be provided for update') {
  // assume user passed in already-optional vals
  return z.object(shape); // .refine((o) => Object.keys(o).length > 0, { message });
}

export const zUpdate = (id: string) => ({
  params: z.object({
    [id]: zObjectId,
  }),
});

export const zDelete = (id: string) => ({
  params: z.object({
    [id]: zObjectId,
  }),
});

export const zObjectId = z
  .string()
  .refine((val) => {
    return mongoose.Types.ObjectId.isValid(val);
  })
  .openapi({ example: '682fd0d7d4a6325d9d45b86d', description: 'A valid MongoDB ObjectId' });

export const zDate = () => z.string().pipe(z.coerce.date());
