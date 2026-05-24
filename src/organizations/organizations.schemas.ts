import { z } from "zod";

export const organizationResponseSchema = z.object({
  id: z
    .string()
    .openapi({ example: "682fd0d7d4a6325d9d45b86e" }),
  name: z
    .string()
    .openapi({ example: "Acme Inc.", description: "Organization name" }),
  email: z
    .string()
    .email()
    .openapi({
      example: "contact@acme.example",
      description: "Primary contact email",
    }),
  kind: z
    .string()
    .optional()
    .openapi({
      example: "private",
      description: "The type or category of the organization",
    }),
}).openapi({
  example: {
    id: "682fd0d7d4a6325d9d45b86e",
    name: "Acme Inc.",
    email: "contact@acme.example",
    kind: "private",
  },
});
