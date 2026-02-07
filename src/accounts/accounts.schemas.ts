import { z } from 'zod';

export const accountResponseSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  organizationId: z.string().uuid(),
  roles: z.array(z.string()), // e.g. ['admin','user']
  isMfaEnabled: z.boolean(),
  createdAt: z.string(), // ISO timestamp
  updatedAt: z.string(), // ISO timestamp
});

// If you ever need the TS type:
export type AccountResponse = z.infer<typeof accountResponseSchema>;
