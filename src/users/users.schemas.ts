import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
extendZodWithOpenApi(z);

export const createUserResponseSchema = z.object({
  id: z.string().openapi({ example: "682fd0d7d4a6325d9d45b86d" }),
  name: z.string().openapi({ example: "Jane Doe" }),
  email: z.string().email().openapi({ example: "jane.doe@example.com" }),
}).openapi({
  example: {
    id: "682fd0d7d4a6325d9d45b86d",
    name: "Jane Doe",
    email: "jane.doe@example.com",
  },
});

export const getUsersResponseSchema = z.array(
  z.object({
    id: z.string().openapi({ example: "682fd0d7d4a6325d9d45b86d" }),
    name: z.string().openapi({ example: "Jane Doe" }),
    email: z.string().email().openapi({ example: "jane.doe@example.com" }),
  }),
).openapi({
  example: [
    {
      id: "682fd0d7d4a6325d9d45b86d",
      name: "Jane Doe",
      email: "jane.doe@example.com",
    },
    {
      id: "682fd0d7d4a6325d9d45b86f",
      name: "John Smith",
      email: "john.smith@example.com",
    },
  ],
});

export const updateUserSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
});

export const updateUserResponseSchema = z.object({
  id: z.string().openapi({ example: "682fd0d7d4a6325d9d45b86d" }),
  name: z.string().openapi({ example: "Jane Doe" }),
  email: z.string().email().openapi({ example: "jane.doe@example.com" }),
}).openapi({
  example: {
    id: "682fd0d7d4a6325d9d45b86d",
    name: "Jane Doe",
    email: "jane.doe@example.com",
  },
});

export const deleteUserResponseSchema = z.object({
  success: z.boolean().openapi({ example: true }),
}).openapi({
  example: {
    success: true,
  },
});
