import { z } from 'zod';

export const deviceNotificationResponseSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  deviceToken: z.string(),
  // optionally include platform or other metadata:
  platform: z.enum(['ios', 'android']).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
