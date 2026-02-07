import httpStatus from 'http-status';
import ApiError from '../utils/ApiError';
import type { Request, Response, NextFunction } from 'express';

const isAdmin = (user: Record<string, any> | undefined): boolean => {
  //return false;
  if (!user) return false;

  // return false; // TODO: Remove this line when the user object is properly defined
  return user['https://memo.wirewire.de/roles'] ? user['https://memo.wirewire.de/roles'].includes('admin') : false;
};

const validateAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  if (isAdmin(req.auth)) {
    next();
  } else {
    next(new ApiError(httpStatus.FORBIDDEN, 'User is not part of the admin group (validateAdmin)'));
  }
};

export { isAdmin, validateAdmin };
