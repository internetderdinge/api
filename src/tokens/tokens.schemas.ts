import { z } from 'zod';

export const tokenResponseSchema = z.object({
  // unique identifier of the token
  tokenId: z.string().uuid(),
  // the owning user
  userId: z.string().uuid(),
  // optional name or description
  name: z.string().optional(),
  // the token value (never returned after creation in real-world apps)
  token: z.string(),
  // timestamps
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
