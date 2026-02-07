import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

extendZodWithOpenApi(z);

export const generatePdfSchema = {
  query: z.object({
    urlPath: z
      .string()
      /* .url()
      .refine(
        (value) =>
          value.startsWith('https://memo.wirewire.de') ||
          value.startsWith('https://web.wirewire.de') ||
          (process.env.NODE_ENV !== 'production' && value.startsWith('http://localhost:3200')),
        {
          message:
            process.env.NODE_ENV !== 'production'
              ? 'urlPath must start with https://memo.wirewire.de, https://web.wirewire.de, or http://localhost:3200'
              : 'urlPath must start with https://memo.wirewire.de or https://web.wirewire.de',
        }
      ) */
      .openapi({
        example: 'https://memo.wirewire.de/example.pdf',
        description:
          'URL path to the PDF generation endpoint. Allowed domains: https://memo.wirewire.de, https://web.wirewire.de' +
          (process.env.NODE_ENV !== 'production' ? ', or http://localhost:3200 (dev)' : ''),
      }),
  }),
};
