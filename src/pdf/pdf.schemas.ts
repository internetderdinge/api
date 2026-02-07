import { z } from 'zod';

export const pdfResponseSchema = z.object({
  url: z.string().url(),
  filename: z.string(),
  size: z.number(),
});
