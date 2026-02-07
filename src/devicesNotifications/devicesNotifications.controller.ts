import httpStatus from 'http-status';

import pick from '../../src/utils/pick';
import ApiError from '../../src/utils/ApiError';
import catchAsync from '../../src/utils/catchAsync';
import devicesNotificationsService from './devicesNotifications.service';

import type { Request, Response } from 'express';

export const createEntry = catchAsync(async (req: Request, res: Response) => {
  const user = await devicesNotificationsService.createNotification({ user: res.req.auth.sub, token: req.body.token });
  res.status(httpStatus.CREATED).send(user);
});

export const setDeviceToken = catchAsync(async (req: Request, res: Response) => {
  const user = await devicesNotificationsService.setDeviceToken({ user: res.req.auth.sub, body: req.body });
  res.status(httpStatus.CREATED).send(user);
});

export const removeDeviceToken = catchAsync(async (req: Request, res: Response) => {
  const user = await devicesNotificationsService.removeDeviceToken({ user: res.req.auth.sub, body: req.body });
  res.status(httpStatus.CREATED).send(user);
});

export const getEntries = catchAsync(async (req: Request, res: Response) => {
  const filter = pick(req.query, ['name', 'role']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await devicesNotificationsService.queryNotifications(filter, options);
  res.send(result);
});

export const queryNotificationsByUser = catchAsync(async (req: Request, res: Response) => {
  const filter = pick({ user: res.req.auth.sub }, ['user']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await devicesNotificationsService.queryNotificationsByUser(filter, options);
  res.send(result);
});

export const getEntry = catchAsync(async (req: Request, res: Response) => {
  const notification = await devicesNotificationsService.getById(req.params.notificationId);
  if (!notification) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Notification not found');
  }
  res.send(notification);
});

export const updateEntry = catchAsync(async (req: Request, res: Response) => {
  const user = await devicesNotificationsService.updateById(req.params.notificationId, req.body);
  res.send(user);
});

export const deleteEntry = catchAsync(async (req: Request, res: Response) => {
  const entry = await devicesNotificationsService.deleteById(req.params.notificationId);
  res.send(entry);
});

export const cleanup = catchAsync(async (req: Request, res: Response) => {
  const entry = await devicesNotificationsService.cleanup();
  res.send(entry);
});

export default {
  createEntry,
  getEntries,
  setDeviceToken,
  removeDeviceToken,
  cleanup,
  queryNotificationsByUser,
  getEntry,
  updateEntry,
  deleteEntry,
};
