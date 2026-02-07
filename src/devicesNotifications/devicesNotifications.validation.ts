import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';
import { objectId } from '../../src/validations/custom.validation';
import { zPagination, zGet, zObjectId, zPatchBody, zUpdate, zDelete } from '../../src/utils/zValidations';

extendZodWithOpenApi(z);

export const createEntrySchema = {
  body: z.object({
    token: z.string().optional().openapi({ description: 'Push token' }),
  }),
};

export const setDeviceTokenSchema = {
  body: z.object({
    token: z.string().openapi({ description: 'Device token' }),
    deviceId: z.string().openapi({ description: 'Device identifier' }),
    plattform: z.string().openapi({ description: 'Platform name' }),
    app: z.string().optional().openapi({ description: 'Application name' }),
  }),
};

export const removeDeviceTokenSchema = {
  body: z.object({
    deviceId: z.string().openapi({ description: 'Device identifier' }),
    plattform: z.string().optional().openapi({ description: 'Platform name' }),
    app: z.string().optional().openapi({ description: 'Application name' }),
    token: z.string().optional().openapi({ description: 'Push token' }),
  }),
};

export const getUsersSchema = {
  ...zPagination,
  query: zPagination.query.extend({
    name: z.string().optional().openapi({ description: 'Filter by user name' }),
    role: z.string().optional().openapi({ description: 'Filter by role' }),
    sortBy: z.string().optional().openapi({ description: 'Sort order' }),
  }),
};

export const getEntrySchema = zGet('notificationId');

export const updateEntrySchema = {
  ...zUpdate('notificationId'),
  body: zPatchBody({
    name: z.string().optional().openapi({ description: 'Notification name' }),
    conditions: z.array(z.any()).optional().openapi({ description: 'Conditions array' }),
    actions: z.array(z.any()).optional().openapi({ description: 'Actions array' }),
    organization: z.string().optional().openapi({ description: 'Organization ID' }),
  }),
};

export const deleteEntrySchema = zDelete('notificationId');

export const cleanupSchema = {};
export const queryNotificationsByUserSchema = {};
