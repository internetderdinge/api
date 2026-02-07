import { z } from 'zod';

// Can be anything starting with nrf- or epd7, or epd- followed by a number
export const deviceId = () =>
  z.string().regex(/^(?:nrf-.*|epd7.*|epd-\d+)$/, {
    message: 'must start with "nrf-", "epd7" or "epd-" followed by a number',
  });

export const objectId = () =>
  z.string().regex(/^[0-9a-fA-F]{24}$/, {
    message: 'must be a valid mongo id',
  });

export const password = () =>
  z
    .string()
    .min(8, 'password must be at least 8 characters')
    .refine((val) => /\d/.test(val) && /[a-zA-Z]/.test(val), {
      message: 'password must contain at least 1 letter and 1 number',
    });

export default {
  deviceId,
  objectId,
  password,
};
