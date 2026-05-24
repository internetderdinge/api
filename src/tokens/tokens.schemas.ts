import { z } from "zod";

export const tokenResponseSchema = z.object({
  tokenId: z
    .string()
    .openapi({
      example: "682fd0d7d4a6325d9d45b872",
      description: "Token ObjectId",
    }),
  userId: z
    .string()
    .openapi({
      example: "682fd0d7d4a6325d9d45b86d",
      description: "Owning user ObjectId",
    }),
  name: z.string().optional().openapi({ example: "Admin integration token" }),
  token: z.string().openapi({
    example: "idt_live_1234567890abcdef",
    description: "Token secret. Usually only returned immediately after creation.",
  }),
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
    tokenId: "682fd0d7d4a6325d9d45b872",
    userId: "682fd0d7d4a6325d9d45b86d",
    name: "Admin integration token",
    token: "idt_live_1234567890abcdef",
    createdAt: "2026-05-21T09:30:00.000Z",
    updatedAt: "2026-05-21T10:15:00.000Z",
  },
});
