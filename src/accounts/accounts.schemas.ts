import { z } from "zod";

export const accountResponseSchema = z.object({
  id: z
    .string()
    .openapi({
      example: "auth0|60452f4c0dc85b0062326",
      description: "Authentication provider account ID",
    }),
  email: z.string().email().openapi({ example: "jane.doe@example.com" }),
  firstName: z.string().optional().openapi({ example: "Jane" }),
  lastName: z.string().optional().openapi({ example: "Doe" }),
  organizationId: z
    .string()
    .openapi({
      example: "682fd0d7d4a6325d9d45b86e",
      description: "Organization ObjectId",
    }),
  roles: z
    .array(z.string())
    .openapi({ example: ["admin", "user"], description: "Account roles" }),
  isMfaEnabled: z.boolean().openapi({ example: true }),
  createdAt: z
    .string()
    .datetime()
    .openapi({ example: "2026-05-21T09:30:00.000Z" }),
  updatedAt: z
    .string()
    .datetime()
    .openapi({ example: "2026-05-21T10:15:00.000Z" }),
}).openapi({
  example: {
    id: "auth0|60452f4c0dc85b0062326",
    email: "jane.doe@example.com",
    firstName: "Jane",
    lastName: "Doe",
    organizationId: "682fd0d7d4a6325d9d45b86e",
    roles: ["admin", "user"],
    isMfaEnabled: true,
    createdAt: "2026-05-21T09:30:00.000Z",
    updatedAt: "2026-05-21T10:15:00.000Z",
  },
});

// If you ever need the TS type:
export type AccountResponse = z.infer<typeof accountResponseSchema>;
