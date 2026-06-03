import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';
import { objectId } from '../validations/custom.validation';
import { zGet, zObjectId, zPagination, zTypeFilter } from '../utils/zValidations';

extendZodWithOpenApi(z);

export const getDevice = {
  params: z.object({
    deviceId: zObjectId.openapi({ description: 'Device ObjectId' }),
  }),
  body: z
    .object({
      deviceId: z
        .array(zObjectId)
        .openapi({ description: 'Array of device IDs' }),
    })
    .openapi({
      example: {
        deviceId: ['682fd0d7d4a6325d9d45b86f'],
      },
    }),
};
export const iotDevicesSchema = {
  ...zPagination,
  query: zPagination.query.extend({
    patient: zObjectId.optional(),
  }),
};

export const getDeviceSchema = {};
export const getEntrySchema = {
  params: z.object({
    deviceId: z.string(),
  }),
};
export const getEventsSchema = {
  params: z.object({
    deviceId: zObjectId.openapi({ description: 'Device ObjectId' }),
  }),
  query: z
    .object({
      DateStart: z
        .string()
        .datetime({ offset: true })
        .openapi({
          description: 'Start date (ISO‐string)',
          example: '2026-05-01T00:00:00Z',
        })
        .optional(),
      DateEnd: z
        .string()
        .datetime({ offset: true })
        .openapi({
          description: 'End date (ISO‐string)',
          example: '2026-05-21T23:59:59Z',
        })
        .optional(),
      TypeFilter: zTypeFilter.default(''),
    })
    .openapi({
      example: {
        DateStart: '2026-05-01T00:00:00Z',
        DateEnd: '2026-05-21T23:59:59Z',
        TypeFilter: 'state',
      },
    }),
};
export const updateEntrySchema = {};

export const pingDeviceSchema = {
  params: z.object({
    deviceId: zObjectId.openapi({ description: 'Device ObjectId' }),
  }),
  query: z.object({
    dataResponse: z.string().openapi({ description: 'Data response', example: 'false' }),
  }),
};

export const shadowAlarmValidationSchema = {
  params: z.object({
    nrfId: z.string().openapi({ description: 'Device ID', example: 'nrf-22343' }),
    shadowName: z.string().openapi({ description: 'Shadow name', example: 'alarm' }),
  }),
};

export const apiStatusRequestSchema = {
  params: z.object({
    kind: z.string().openapi({ description: 'Kind of API status', example: 'iot' }),
  }),
};
