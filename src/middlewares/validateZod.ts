import type { Request, Response, NextFunction } from 'express';
import type { ZodObject, ZodRawShape } from 'zod';
import ApiError from '../utils/ApiError';
import httpStatus from 'http-status';
import { z } from 'zod';

interface Schema {
  body?: ZodObject<ZodRawShape>;
  query?: ZodObject<ZodRawShape>;
  params?: ZodObject<ZodRawShape>;
}

const createValidationError = (raw: unknown) =>
  new ApiError(
    httpStatus.BAD_REQUEST,
    'Validation error',
    undefined,
    undefined,
    raw,
  );

export const validateZod = (schema: Schema) => (req: Request, res: Response, next: NextFunction) => {
  try {
    schema.body ||= z.object({});
    schema.query ||= z.object({});
    schema.params ||= z.object({});

    // 1) run safeParse on each
    const result = {
      body: schema.body.strict().safeParse(req.body || {}),
      query: schema.query.strict().safeParse(req.query),
      params: schema.params.strict().safeParse(req.params),
    };

    // 2) if any failure, short-circuit
    if (!result.body.success || !result.query.success || !result.params.success) {
      return next(createValidationError(result));
    }

    // 3) merge parsed data back in
    req.body = result.body.data;
    Object.assign(req.query as Record<string, any>, result.query.data);
    Object.assign(req.params as Record<string, any>, result.params.data);

    return next();
  } catch (err: any) {
    console.error('Zod validation error:', err);
    return next(createValidationError(err));
  }
};

export default validateZod;
