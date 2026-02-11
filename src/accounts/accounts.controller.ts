// @ts-nocheck
import type { Request, Response } from "express";
import httpStatus from "http-status";
import deviceNotifications from "../devicesNotifications/devicesNotifications.service";
import ApiError from "../utils/ApiError.js";
import catchAsync from "../utils/catchAsync.js";
import * as accountsService from "./accounts.service.js";

interface AuthenticatedRequest extends Request {
  auth: {
    sub: string;
  };
}

interface Device {
  fck: string;
}

interface UpdateBody {
  given_name?: string;
  family_name?: string;
  email?: string;
  notification?: any;
  [key: string]: any;
}

const getAccountById = catchAsync(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const account = await accountsService.getAccountById(req.auth.sub);

    const entryDeviceNotifications = await deviceNotifications.getByUser(
      req.auth.sub,
    );

    if (!account) {
      throw new ApiError(httpStatus.NOT_FOUND, "Account not found");
    }
    res.send({
      ...account.data,
      notification: entryDeviceNotifications?.settings,
    });
  },
);

const setDeviceToken = catchAsync(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const account = await accountsService.getAccountById(req.auth.sub);

    const devices: Device[] = account.data.app_metadata.devices || [];
    const alreadyExisting = devices.find((d) => d.fck === req.body.token);
    if (!alreadyExisting) {
      devices.push({ fck: req.body.token });
    }
    const update = {
      ...account.app_metadata,
      devices: devices.slice(Math.max(devices.length - 3, 1)),
    };
    const entry = await accountsService.updateMetaDataById(
      req.auth.sub,
      update,
    );
    res.send(entry);
  },
);

const avatar = catchAsync(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const avatarImage = await auth0.avatar(req.auth.sub);
    res.send(avatarImage);
  },
);

const updateEntry = catchAsync(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const account = await accountsService.getAccountById(req.auth.sub);

    const { isSocial } = account?.data.identities[0];

    const {
      given_name,
      family_name,
      email,
      notification,
      ...updateBody
    }: UpdateBody = req.body;

    const trimmedGivenName =
      typeof given_name === "string" ? given_name.trim() : undefined;
    const trimmedFamilyName =
      typeof family_name === "string" ? family_name.trim() : undefined;
    const hasGivenName = !!trimmedGivenName;
    const hasFamilyName = !!trimmedFamilyName;

    const update = isSocial
      ? {
          ...account.data.app_metadata,
          ...updateBody,
          ...(hasGivenName ? { first_name: trimmedGivenName } : {}),
          ...(hasFamilyName ? { last_name: trimmedFamilyName } : {}),
        }
      : updateBody;
    const entry = await accountsService.updateMetaDataById(
      req.auth.sub,
      update,
    );

    if (notification) {
      await deviceNotifications.updateByUserId(req.auth.sub, {
        settings: notification,
      });
    }

    if (!isSocial && (hasGivenName || hasFamilyName || email)) {
      try {
        await accountsService.updateUserById(req.auth.sub, {
          ...(hasGivenName ? { given_name: trimmedGivenName } : {}),
          ...(hasFamilyName ? { family_name: trimmedFamilyName } : {}),
          ...(email ? { email } : {}),
        });
      } catch (error: any) {
        console.error("error", error.message);
        throw new ApiError(httpStatus.CONFLICT, error.message);
      }
    }
    res.send(entry);
  },
);

const deleteCurrent = catchAsync(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const entry = await accountsService.deleteById(req.auth.sub);
    res.send(entry);
  },
);

const current = catchAsync(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const user = await accountsService.getAccountById(req.auth.sub);
    res.send(user.data);
  },
);

const mfaEnroll = catchAsync(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { mfaEnroll } = req.body;
    const user = await accountsService.mfaEnroll(req.auth.sub, mfaEnroll);
    res.send(user);
  },
);

const mfaDisable = catchAsync(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const user = await accountsService.mfaDisable(req.auth.sub);
    res.send(user);
  },
);

export {
  avatar,
  getAccountById,
  current,
  setDeviceToken,
  mfaEnroll,
  updateEntry,
  deleteCurrent,
  mfaDisable,
};
