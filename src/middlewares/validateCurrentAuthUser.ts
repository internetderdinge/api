import httpStatus from 'http-status';
import ApiError from '../utils/ApiError';
import type { Request, Response, NextFunction } from 'express';

const getCurrentAuthUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  if (res.req.auth.sub !== req.params.notificationId) {
    next(new ApiError(httpStatus.BAD_REQUEST, 'Not allowed to access'));
    return;
  }

  next();
};

export const validateParamsAccount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  if (res.req.auth.sub !== req.params.accountId) {
    next(new ApiError(httpStatus.BAD_REQUEST, 'Not allowed to access'));
    return;
  }

  next();
};

export default getCurrentAuthUser;
