import { z } from 'zod';

export const organizationResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  kind: z.string().optional(),
});
