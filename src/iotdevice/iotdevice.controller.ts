import type { Request, Response } from "express";
import catchAsync from "../utils/catchAsync";
import devicesService from "../devices/devices.service";
import iotDevicesService from "./iotdevice.service";
import httpStatus from "http-status";
import ApiError from "../utils/ApiError";

import type { Device, ShadowUpdatePayload } from "./iotdevice.types"; // Example type imports

export const getIotDevices = catchAsync(async (req: Request, res: Response) => {
  const iotDevices = await iotDevicesService.getDeviceStatusList();
  res.send({ results: iotDevices });
});

export const getEvents = catchAsync(async (req: Request, res: Response) => {
  const device = await devicesService.getById(req.params.deviceId);
  const events = await iotDevicesService.getEvents({
    ...req.query,
    DeviceId: device.deviceId,
  });
  res.send({ ...events, device });
});

export const getDevice = catchAsync(async (req: Request, res: Response) => {
  const events = await iotDevicesService.getDevice(req.body.deviceId);
  res.send(events);
});

export const activateDevice = catchAsync(
  async (req: Request, res: Response) => {
    const events = await iotDevicesService.activateDevice(req.body.deviceId);
    res.send(events);
  },
);

export const pingDevice = catchAsync(async (req: Request, res: Response) => {
  const events = await iotDevicesService.pingDevice(req.body.deviceId);
  res.send(events);
});

export const shadowAlarmUpdate = catchAsync(
  async (req: Request, res: Response) => {
    const device = await devicesService.getById(req.params.deviceId);
    const { shadowName, ...others } = req.body as ShadowUpdatePayload;
    const shadow = await iotDevicesService.shadowAlarmUpdate(
      device.deviceId,
      others,
      shadowName,
    );
    res.send({ device, shadow });
  },
);

export const shadowAlarmGet = catchAsync(
  async (req: Request, res: Response) => {
    const device = await devicesService.getById(req.params.deviceId);
    const shadow = await iotDevicesService.shadowAlarmGet(
      device.deviceId,
      req.body,
    );
    res.send({ device, shadow });
  },
);

export const shadowAdmin = catchAsync(async (req: Request, res: Response) => {
  const shadow = await iotDevicesService.shadowAlarmGet(
    req.params.nrfId,
    req.params.shadowName,
  );
  res.send(shadow);
});

export const getDeviceStatus = catchAsync(
  async (req: Request, res: Response) => {
    const events = await iotDevicesService.getDeviceStatus(req.params.deviceId);
    res.send(events);
  },
);

export const ledLightHint = catchAsync(async (req: Request, res: Response) => {
  const device = await devicesService.getById(req.params.deviceId);
  const shadow = await iotDevicesService.ledLightHint(
    device.deviceId,
    req.body,
  );
  res.send({ device, shadow });
});

export const resetDevice = catchAsync(async (req: Request, res: Response) => {
  const device = await devicesService.getById(req.params.deviceId);
  const shadow = await iotDevicesService.resetDevice(device.deviceId, req.body);
  res.send({ device, shadow });
});

export const getEntry = catchAsync(async (req: Request, res: Response) => {
  const iotDevice = await iotDevicesService.getDevice([req.params.deviceId]);
  if (!iotDevice?.message?.[0]) {
    throw new ApiError(httpStatus.NOT_FOUND, "IoT Device not found");
  }
  res.send(iotDevice.message[0]);
});

export const updateEntry = catchAsync(async (req: Request, res: Response) => {
  const user = await iotDevicesService.updateById(req.params.stockId, req.body);
  res.send(user);
});

export const deleteEntry = catchAsync(async (req: Request, res: Response) => {
  const entry = await iotDevicesService.deleteById(req.params.stockId);
  res.send(entry);
});

export const getApiStatus = catchAsync(async (req: Request, res: Response) => {
  const events = await iotDevicesService.getApiStatus(req.params.kind);
  if (!events) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "API unavailable");
  }
  res.send(events);
});

export default {
  getEvents,
  getIotDevices,
  getDevice,
  shadowAlarmGet,
  shadowAdmin,
  pingDevice,
  getDeviceStatus,
  ledLightHint,
  shadowAlarmUpdate,
  getEntry,
  getApiStatus,
  updateEntry,
  resetDevice,
  deleteEntry,
};
