import httpStatus from "http-status";
import ApiError from "../utils/ApiError";
import devicesService from "../devices/devices.service";
import { isAdmin } from "./validateAdmin";
import usersService from "../users/users.service";

import type { Request, Response, NextFunction } from "express";
import type { User } from "../users/users.types";
import type { Device } from "../devices/devices.types";

const validateDeviceIsInOrganization = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const deviceId = (req.body?.deviceId ||
    req.params?.deviceId ||
    req.query?.deviceId) as string | undefined;

  if (!deviceId) {
    next();
    return;
  }

  const device = await devicesService.getById(deviceId);

  if (!device) {
    next(new ApiError(httpStatus.NOT_FOUND, "Device not found"));
    return;
  }

  if (isAdmin(res.req.auth)) {
    next();
    return;
  }

  const currentUser: User | null = await usersService.getUserByOwner(
    res.req.auth.sub,
    device.organization,
  );

  if (!currentUser) {
    next(
      new ApiError(
        httpStatus.FORBIDDEN,
        "User is not part of the organization for this device",
      ),
    );
    return;
  }

  if (
    req.body?.organization &&
    req.body.organization.toString() !== device.organization?.toString()
  ) {
    next(
      new ApiError(
        httpStatus.FORBIDDEN,
        "Device is not part of the provided organization",
      ),
    );
    return;
  }

  req.currentUser = currentUser;
  next();
};

const validateDevice = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  if (isAdmin(res.req.auth)) {
    next();
  } else {
    const currentDevice: Device | null = await devicesService.getById(
      req.params.deviceId,
    );
    if (!currentDevice) {
      next(new ApiError(httpStatus.NOT_FOUND, "Device not found"));
      return;
    }

    const currentUser: User | null = await usersService.getUserByOwner(
      res.req.auth.sub,
      currentDevice.organization,
    );
    if (!currentUser) {
      next(
        new ApiError(
          httpStatus.FORBIDDEN,
          "User is not part of the organization which has access to the device (validateDevice)",
        ),
      );
      return;
    }

    req.currentUser = currentUser;
    next();
  }
};

const validateDeviceQuery = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  if (isAdmin(res.req.auth)) {
    next();
  } else {
    // console.log('Validating device query for user:', res.req.auth.sub, req.query);
    const currentDevice: Device | null = await devicesService.getById(
      req.query.deviceId as string,
    );
    if (!currentDevice) {
      next(new ApiError(httpStatus.NOT_FOUND, "Device not found"));
      return;
    }

    const currentUser: User | null = await usersService.getUserByOwner(
      res.req.auth.sub,
      currentDevice.organization,
    );
    if (!currentUser) {
      next(
        new ApiError(
          httpStatus.FORBIDDEN,
          "User is not part of the organization (validateDeviceOrOrganizationQuery)",
        ),
      );
      return;
    }

    req.currentUser = currentUser;
    next();
  }
};

const validateDeviceOrOrganizationQuery = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  if (isAdmin(res.req.auth)) {
    next();
    return;
  }

  const deviceId = req.query.deviceId as string;
  const organizationId = req.query.organization as string;

  if (deviceId) {
    return validateDeviceQuery(req, res, next);
  }

  if (organizationId) {
    const currentUser: User | null = await usersService.getUserByOwner(
      res.req.auth.sub,
      organizationId,
    );

    if (!currentUser) {
      next(
        new ApiError(
          httpStatus.FORBIDDEN,
          "User is not part of the organization which has access to the device (validateDeviceQuery)",
        ),
      );
      return;
    }

    req.currentUser = currentUser;
    next();
    return;
  }

  next(
    new ApiError(
      httpStatus.BAD_REQUEST,
      "deviceId or organization is required",
    ),
  );
};

export {
  validateDevice,
  validateDeviceQuery,
  validateDeviceOrOrganizationQuery,
  validateDeviceIsInOrganization,
};
