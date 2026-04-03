// @ts-nocheck
import httpStatus from "http-status";
import Device from "./devices.model.js";
import ApiError from "../utils/ApiError.js";
import iotDevicesService from "../iotdevice/iotdevice.service.js";

import { promisify } from "util";
import { deviceByDeviceName, deviceKindHasFeature } from "../utils/deviceUtils";

import type { DeviceDocument, DeviceInput } from "./devices.model.js";
import type { ApiErrorType } from "../utils/ApiError.js";
import type { IoTDeviceResponse } from "../iotdevice/iotdevice.service.js";
import * as usersService from "../users/users.service";

const setTimeoutAsync = promisify(setTimeout);

/**
 * Register a new device
 */
export const registerDevice = async ({
  id,
  body,
}: {
  id: string;
  body: DeviceInput;
}): Promise<IoTDeviceResponse & { createdDevice?: DeviceDocument }> => {
  const iotDevices = await iotDevicesService.activateDevice(
    id,
    body.organization,
    body.enable,
  );

  if (iotDevices.activation_status === "success") {
    let patient;
    if (body.patient) {
      patient = await usersService.getById(body.patient);
    }

    const deviceListData = deviceByDeviceName(id);

    const createdDevice = await Device.create({
      deviceId: id,
      ...body,
      kind: deviceListData.id,
      meta: {
        name:
          patient && patient.meta?.firstName
            ? `${patient.meta.firstName} ${patient.meta.lastName} ANABOX smart`
            : undefined,
      },
    });
    return { ...iotDevices, createdDevice };
  }
  return iotDevices;
};

export const getAllDevices = async (): Promise<DeviceDocument[]> => {
  return Device.find();
};

export const createDevice = async (
  userBody: DeviceInput,
): Promise<DeviceDocument> => {
  return Device.create(userBody);
};

export const populateIotDevice = async (e: {
  deviceId: string;
}): Promise<IoTDeviceResponse | null> => {
  const iotDevices = await iotDevicesService.getDevice([e.deviceId]);

  try {
    if (iotDevices) {
      const iotDevice = iotDevices.message.find(
        (c) => c.serialNumber === e.deviceId,
      );
      return iotDevice || null;
    }
  } catch (error) {
    console.error(error);
    return null;
  }
  return null;
};

export const populateIotShadow = async (
  e: { deviceId: string },
  shadowName: string,
): Promise<any> => {
  const iotDevices = await iotDevicesService.shadowAlarmGet(
    e.deviceId,
    shadowName,
  );
  return iotDevices;
};

export const populateDeviceStatus = async (e: {
  deviceId: string;
  kind: string;
}): Promise<any> => {
  if (!e.deviceId) return null;
  const deviceStatus = await iotDevicesService.getDeviceStatus(
    e.deviceId,
    e.kind,
  );
  return deviceStatus;
};

export const populateIotDevices = async (
  data: DeviceDocument[],
): Promise<any[]> => {
  const nrfList = data.map((e) => e.deviceId);
  const iotDevices = await iotDevicesService.getDevice(nrfList);

  if (iotDevices) {
    return data.map((e) => {
      const iotDevice = iotDevices.message.find(
        (c) => c.serialNumber === e.deviceId,
      );
      if (e.kind === "anabox-smart") return { ...e.toJSON(), iotDevice };
      return e;
    });
  }
  return data;
};

export const queryDevicesByUser = async (
  filter: any,
  options: any,
): Promise<any> => {
  const devices = await Device.paginate(filter, options);
  return devices;
};

export const getDeviceByUserId = async (
  patient: string,
): Promise<DeviceDocument | null> => {
  return Device.findOne({ patient });
};

export const getById = async (id: string): Promise<DeviceDocument> => {
  const device = await Device.findById(id);
  //if (!device) throw new ApiError(httpStatus.NOT_FOUND, `Device not found id: ${id}`);
  return device;
};

export const getByIdWithIoT = async (id: string): Promise<any> => {
  const device = await getById(id);
  if (!device) {
    throw new ApiError(httpStatus.NOT_FOUND, `Device not found id: ${id}`);
  }
  const deviceJSON = device.toJSON();
  const iotDevice = await populateIotDevice(device);
  const shadow = await populateIotShadow(device, "settings");
  const deviceStatus = await populateDeviceStatus(device);

  deviceJSON.iotDevice = iotDevice;
  deviceJSON.shadow = shadow;
  deviceJSON.deviceStatus = deviceStatus;

  return deviceJSON;
};

export const getDeviceByDeviceId = async (
  deviceId: string,
): Promise<DeviceDocument | null> => {
  return Device.findOne({ deviceId });
};

export const updatePaymentById = async (
  deviceId: string,
  updateBody: any,
): Promise<void> => {
  const device = await getById(deviceId);
  device.payment = updateBody;
  await device.save();
};

export const updateById = async (
  userId: string,
  updateBody: any,
): Promise<any> => {
  const device = await getById(userId);

  Object.assign(device, updateBody);

  await device.save();

  const shadowBody = {
    state: {
      reported: {},
    },
  };

  if (device.kind === "anabox-smart") {
    shadowBody.state.reported.take_offset_time = updateBody.takeOffsetTime;
    shadowBody.state.reported.alarm_enable = updateBody.alarmEnable;
  }
  if (deviceKindHasFeature("epaper", device.kind)) {
    const sleepTime = parseInt(device.meta?.sleepTime);
    shadowBody.state.reported.sleepTime = isNaN(sleepTime) ? 3600 : sleepTime;
    shadowBody.state.reported.clearScreen = true;
    shadowBody.state.reported.showOverlay =
      device.meta?.showOverlay === undefined ? true : device.meta?.showOverlay;
  }

  // console.log('shadowBody', updateBody, shadowBody, device.kind);

  const shadowNew = await iotDevicesService.shadowAlarmUpdate(
    device.deviceId,
    shadowBody,
    "settings",
  );

  const iotDevice = await populateIotDevice(device);
  const shadow = await populateIotShadow(device);
  const deviceJSON = device.toJSON();
  deviceJSON.iotDevice = iotDevice;
  deviceJSON.shadow = shadow;
  return deviceJSON;
};

export const deleteById = async (
  userId: string,
  deleteFromIotApi = true,
): Promise<DeviceDocument> => {
  const device = await getById(userId);
  if (!device) {
    throw new ApiError(httpStatus.NOT_FOUND, "Device not found");
  }

  if (device.kind === "anabox-smart" && deleteFromIotApi) {
    const iotDevice = await iotDevicesService.activateDevice(
      device.deviceId,
      device.organization,
      false,
      true,
    );
    if (!iotDevice) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        "Anabox-Smart Device could not be unlinked.",
      );
    }
  }

  if (deviceKindHasFeature("epaper", device.kind) && deleteFromIotApi) {
    const iotDevice = await iotDevicesService.activateDevice(
      device.deviceId,
      device.organization,
      false,
      true,
    );

    if (!iotDevice) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        "Epaper device could not be unlinked.",
      );
    }
  }

  await device.deleteOne();
  return device;
};

export default {
  getById,
  getByIdWithIoT,
  getDeviceByUserId,
  getDeviceByDeviceId,
  updateById,
  updatePaymentById,
  deleteById,
  populateIotDevices,
  populateDeviceStatus,
  queryDevicesByUser,
  registerDevice,
  getAllDevices,
  createDevice,
  populateIotDevice,
  populateIotShadow,
};
