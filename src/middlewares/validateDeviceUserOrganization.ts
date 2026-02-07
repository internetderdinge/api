import httpStatus from "http-status";
import ApiError from "../utils/ApiError";
import devicesService from "../devices/devices.service";
import { isAdmin } from "./validateAdmin";

import type { Request, Response, NextFunction } from "express";
import type { Device } from "../devices/devices.types";
import type { User } from "../users/users.types";
import userService from "../users/users.service";

export const validateDeviceUserOrganization = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  if (isAdmin(res.req.auth)) {
    next();
    return;
  }

  if (req.body.patient) {
    const currentDevice: Device | null = await devicesService.getById(
      req.params.deviceId,
    );
    if (!currentDevice) {
      next(
        new ApiError(
          httpStatus.FORBIDDEN,
          "Device was not found (validateDeviceUserOrganization)",
        ),
      );
      return;
    }

    const currentUser: User | null =
      await userService.getUsersByOrganizationAndId(
        currentDevice.organization,
        req.body.patient,
      );
    if (!currentUser) {
      next(
        new ApiError(
          httpStatus.FORBIDDEN,
          "User is not part of the organization which has access to the device (validateDeviceUserOrganization)",
        ),
      );
      return;
    }

    req.currentUser = currentUser;
  }

  next();
};
