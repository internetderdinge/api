import httpStatus from "http-status";
import mongoose from "mongoose";
import multer from "multer";
import type { Request, Response } from "express";
import pick from "../utils/pick.js";
import ApiError from "../utils/ApiError.js";
import catchAsync from "../utils/catchAsync.js";
import * as devicesService from "./devices.service.js";
import * as iotDevicesService from "../iotdevice/iotdevice.service.js";
import { filterOptions } from "../utils/filterOptions.js";
import { isAdmin } from "../middlewares/validateAdmin.js";

const createEntry = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const user = await devicesService.createDevice(req.body);
    res.status(httpStatus.CREATED).send(user);
  },
);

const registerDevice = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const checkDevice = await devicesService.getDeviceByDeviceId(
      req.params.deviceId,
    );

    if (checkDevice) {
      const iotDevices = await iotDevicesService.activateDevice(
        req.params.deviceId,
        req.body.organization,
        true,
      );

      // Get Events if update is happening
      if (iotDevices.activation_status === "success") {
        if (checkDevice.organization.equals(req.body.organization)) {
          res.status(httpStatus.CONFLICT).send({
            message:
              "Device is already existing and registered in this organization, no hardware reset detected",
            device: checkDevice,
          });
        } else {
          throw new ApiError(
            httpStatus.CONFLICT,
            "Device is already existing and registered in another organization, no hardware reset detected",
          );
        }
      } else {
        // Delete device if already existing but not activation_status
        await devicesService.deleteById(checkDevice.id, false);
      }

      res.status(httpStatus.CREATED).send(iotDevices);
    } else {
      const devices = await devicesService.registerDevice({
        id: req.params.deviceId,
        body: req.body,
      });
      res.status(httpStatus.CREATED).send(devices);
    }
  },
);

const getEntries = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const filter = pick(req.query, ["name", "role"]);
    const options = pick(req.query, ["sortBy", "limit", "page"]);
    const result = await devicesService.queryDevices(filter, options);
    res.send(result);
  },
);

const queryDevicesByUser = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const filter = pick(req.query, ["name", "role", "organization", "patient"]);
    const options = pick(req.query, ["sortBy", "limit", "page"]);

    options.limit = 1000;

    const filteredOptions = filterOptions(req.query, filter, {
      objectIds: ["_id", "patient"],
      search: [
        "meta.name",
        "deviceId",
        "payment.id",
        "payment.customer",
        "kind",
        "patientData.meta.firstName",
        "patientData.meta.lastName",
      ],
    });

    const optionsPopulate = {
      ...options,
      populate: "patientData",
    };

    const result = await devicesService.queryDevicesByUser(
      filteredOptions,
      optionsPopulate,
    );

    if (
      req.currentUser?.role &&
      req.currentUser.role === "onlyself" &&
      result?.results
    ) {
      const currentUserId = new mongoose.Types.ObjectId(req.currentUser.id);
      result.results = result.results.filter((user) => {
        // Prefer value comparison over object reference comparison
        return currentUserId.equals(user.patient);
        // Alternatively:
        // return String(user.patient) === String(req.currentUser.id);
      });
    }

    res.send(result);
  },
);

const getEntry = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const device = await devicesService.getByIdWithIoT(req.params.deviceId);

    if (!device) {
      throw new ApiError(httpStatus.NOT_FOUND, "Device not found");
    }
    res.send(device);
  },
);

const getImageById = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const device = await devicesService.getImageById(
      req.params.deviceId,
      req.params.uuid,
    );
    if (!device) {
      throw new ApiError(httpStatus.NOT_FOUND, "Device not found");
    }
    res.send(device);
  },
);

const updateEntry = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    // TODO: Remove in newer versions
    const { updatedAt, createdAt, payment, iotDevice, ...newBody } = req.body;

    const body = {
      ...newBody,
      shadow:
        typeof req.body?.shadow === "object" ? req.body.shadow : undefined,
    };

    if (isAdmin(res.req.auth) && payment) {
      body.payment = payment;
    }

    const device = await devicesService.updateById(req.params.deviceId, body); //TODO: remove shadow

    if (isAdmin(res.req.auth) && iotDevice && device.deviceId) {
      const iotDeviceUpdate = await iotDevicesService.updateDevice(
        device.deviceId,
        iotDevice,
      );
    }

    res.send(device);
  },
);

const getEvents = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const device = await devicesService.getById(req.params.deviceId);
    const events = await iotDevicesService.getEvents({
      ...req.query,
      createdAt: device.createdAt,
      DeviceId: device.deviceId,
    });
    res.send({ ...events, device });
  },
);

const deleteEntry = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const entry = await devicesService.deleteById(req.params.deviceId);
    //res.status(httpStatus.NO_CONTENT).send();
    res.send(entry);
  },
);

const pingDevice = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const device = await devicesService.getByIdWithIoT(req.params.deviceId);
    const ping = await iotDevicesService.pingDevice(device.deviceId, req.query);
    res.send({ device, ping });
  },
);

export const resetDevice = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const device = await devicesService.getByIdWithIoT(req.params.deviceId);
    const reset = await iotDevicesService.resetDevice(
      device.deviceId,
      req.body,
    );
    res.send({ device, reset });
  },
);

const ledLight = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const device = await devicesService.getByIdWithIoT(req.params.deviceId);
    const ping = await iotDevicesService.ledLightHint(
      device.deviceId,
      req.body,
    );
    res.send({ device, ping });
  },
);

const rebootDevice = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const device = await devicesService.getByIdWithIoT(req.params.deviceId);
    const reboot = await iotDevicesService.rebootDevice(device.deviceId);
    res.send({ device, reboot });
  },
);

const updateSingleImageMeta = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const device = await devicesService.getById(req.params.deviceId);

    const { uuid, ...body } = req.body;
    const deviceUpdate = await devicesService.updateById(req.params.deviceId, {
      meta: { ...device.meta, file: uuid },
    });
    const deviceMeta = await devicesService.updateSingleImageMeta(
      device.deviceId,
      body,
    );
    res.send({ deviceMeta, deviceUpdate });
  },
);

const uploadSingleImage = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const device = await devicesService.getById(req.params.deviceId);

    const iotUpload = await iotDevicesService.uploadSingleImage({
      deviceName: device.deviceId,
      buffer: req.files[0].buffer,
      deviceId: req.params.deviceId,
      uuid: req.body.uuid,
    });

    res.send(iotUpload);
  },
);

export {
  createEntry,
  getEntries,
  queryDevicesByUser,
  getEvents,
  getImageById,
  registerDevice,
  pingDevice,
  ledLight,
  rebootDevice,
  uploadSingleImage,
  updateSingleImageMeta,
  getEntry,
  updateEntry,
  deleteEntry,
};
