import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

export const registry = new OpenAPIRegistry();

// add Bearer JWT auth
export const bearerAuth = registry.registerComponent(
  "securitySchemes",
  "bearerAuth",
  {
    type: "http",
    scheme: "bearer",
    bearerFormat: "JWT",
    description: "JWT Bearer authentication",
  },
);

export const xApiKey = registry.registerComponent(
  "securitySchemes",
  "x-api-key",
  {
    type: "apiKey",
    in: "header",
    name: "x-api-key",
    description: "API key for authentication",
  },
);

const UserSchema = z
  .object({
    id: z.string().openapi({ example: "1212121" }),
    name: z.string().openapi({ example: "John Doe" }),
    age: z.number().openapi({ example: 42 }),
  })
  .openapi("User");

registry.registerPath({
  method: "get",
  path: "/usersnnn/{id}",
  summary: "Get a single user",
  request: {
    params: z.object({ id: z.string() }),
  },

  responses: {
    200: {
      description: "Object with user data.",
      content: {
        "application/json": {
          schema: UserSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/users/{id}",
  description: "Get user data by its id",
  summary: "Get a single user",
  request: {
    params: z.object({
      id: z.string().openapi({ example: "1212121" }),
    }),
  },
  responses: {
    200: {
      description: "Object with user data.",
      content: {
        "application/json": {
          schema: UserSchema,
        },
      },
    },
    204: {
      description: "No content - successful operation",
    },
  },
});
