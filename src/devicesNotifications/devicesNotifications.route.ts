import { Router } from 'express';
import buildRouterAndDocs from '../../src/utils/buildRouterAndDocs';
import type { RouteSpec } from '../types/routeSpec';

import auth from '../../src/middlewares/auth';
import validateCurrentUser from '../../src/middlewares/validateCurrentUser';
import { validateAdmin } from '../../src/middlewares/validateAdmin';
import validateCurrentAuthUser from '../../src/middlewares/validateCurrentAuthUser';

import {
  createEntrySchema,
  queryNotificationsByUserSchema,
  setDeviceTokenSchema,
  removeDeviceTokenSchema,
  cleanupSchema,
  getEntrySchema,
  updateEntrySchema,
  deleteEntrySchema,
} from './devicesNotifications.validation';

import { deviceNotificationResponseSchema } from './devicesNotifications.schemas';

import {
  createEntry,
  queryNotificationsByUser,
  setDeviceToken,
  removeDeviceToken,
  cleanup,
  getEntry,
  updateEntry,
  deleteEntry,
} from './devicesNotifications.controller';

export const devicesNotificationsRouteSpecs: RouteSpec[] = [
  {
    method: 'post',
    path: '/',
    validate: [auth('manageUsers')],
    requestSchema: createEntrySchema,
    responseSchema: deviceNotificationResponseSchema,
    privateDocs: true,
    handler: createEntry,
    summary: 'Create a new device-notification entry',
  },
  {
    method: 'get',
    path: '/',
    validate: [auth('getUsers')],
    requestSchema: queryNotificationsByUserSchema,
    responseSchema: deviceNotificationResponseSchema.array(),
    privateDocs: true,
    handler: queryNotificationsByUser,
    summary: 'Query notifications by user',
  },
  {
    method: 'post',
    path: '/setDeviceToken',
    validate: [auth('manageUsers')],
    requestSchema: setDeviceTokenSchema,
    responseSchema: deviceNotificationResponseSchema,
    privateDocs: true,
    handler: setDeviceToken,
    summary: 'Associate a device token with a user',
  },
  {
    method: 'get',
    path: '/setDeviceToken',
    validate: [auth('getUsers'), validateCurrentUser],
    requestSchema: queryNotificationsByUserSchema,
    responseSchema: deviceNotificationResponseSchema.array(),
    privateDocs: true,
    handler: queryNotificationsByUser,
    summary: 'Query notifications by user (after setting token)',
  },
  {
    method: 'post',
    path: '/removeDeviceToken',
    validate: [auth('manageUsers')],
    requestSchema: removeDeviceTokenSchema,
    responseSchema: deviceNotificationResponseSchema,
    privateDocs: true,
    handler: removeDeviceToken,
    summary: 'Remove a device token from a user',
  },
  {
    method: 'get',
    path: '/removeDeviceToken',
    validate: [auth('getUsers'), validateCurrentUser],
    requestSchema: queryNotificationsByUserSchema,
    responseSchema: deviceNotificationResponseSchema.array(),
    privateDocs: true,
    handler: queryNotificationsByUser,
    summary: 'Query notifications by user (after removing token)',
  },
  {
    method: 'get',
    path: '/cleanup',
    validate: [auth('manageUsers'), validateAdmin],
    requestSchema: cleanupSchema,
    responseSchema: deviceNotificationResponseSchema.array(),
    privateDocs: true,
    handler: cleanup,
    summary: 'Cleanup old device-notification entries',
  },
  {
    method: 'get',
    path: '/cleanup',
    validate: [auth('getUsers'), validateCurrentUser, validateAdmin],
    requestSchema: queryNotificationsByUserSchema,
    responseSchema: deviceNotificationResponseSchema.array(),
    privateDocs: true,
    handler: queryNotificationsByUser,
    summary: 'Query notifications by user (after cleanup)',
  },
  {
    method: 'get',
    path: '/:notificationId',
    validate: [auth('getUsers')],
    requestSchema: getEntrySchema,
    responseSchema: deviceNotificationResponseSchema,
    privateDocs: true,
    handler: getEntry,
    summary: 'Get a device-notification by ID',
  },
  {
    method: 'patch',
    path: '/:notificationId',
    validate: [auth('manageUsers'), validateCurrentAuthUser],
    requestSchema: updateEntrySchema,
    responseSchema: deviceNotificationResponseSchema,
    privateDocs: true,
    handler: updateEntry,
    summary: 'Update a device-notification by ID',
  },
  {
    method: 'delete',
    path: '/:notificationId',
    validate: [auth('manageUsers'), validateCurrentAuthUser],
    requestSchema: deleteEntrySchema,
    responseSchema: deviceNotificationResponseSchema,
    privateDocs: true,
    handler: deleteEntry,
    summary: 'Delete a device-notification by ID',
  },
];

const router = Router();
buildRouterAndDocs(router, devicesNotificationsRouteSpecs, '/devices-notifications', ['DevicesNotifications']);

export default router;
