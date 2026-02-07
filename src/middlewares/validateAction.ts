import httpStatus from 'http-status';
import ApiError from '../utils/ApiError';
import { isAdmin } from './validateAdmin';

import type { Request, Response, NextFunction } from 'express';

export const validateOrganizationUpdate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  if (isAdmin(res.req.auth)) {
    next();
  } else {
    if (!req.currentUser) {
      next(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Current user not set in request'));
      return;
    }

    if (req.currentUser.role && req.currentUser.role === 'onlyself') {
      next(new ApiError(httpStatus.FORBIDDEN, 'User does not have sufficient permissions in the organization to update'));
      return;
    }

    next();
  }
};

export const validateOrganizationDelete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  if (isAdmin(res.req.auth)) {
    next();
  } else {
    if (!req.currentUser) {
      next(new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Current user not set in request'));
      return;
    }

    if (req.currentUser.role && req.currentUser.role === 'onlyself') {
      next(new ApiError(httpStatus.FORBIDDEN, 'User does not have sufficient permissions in the organization to update'));
      return;
    }

    next();
  }
};
