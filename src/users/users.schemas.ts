import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
extendZodWithOpenApi(z);

export const createUserResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
});

export const getUsersResponseSchema = z.array(
  z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
  }),
);

export const updateUserSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
});

export const updateUserResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
});

export const deleteUserResponseSchema = z.object({
  success: z.boolean(),
});
