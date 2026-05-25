import type { NextFunction, Request, Response } from 'express';
import type { ZodTypeAny } from 'zod';
import { HttpError } from '../utils/http-error';

export function validate(schema: ZodTypeAny) {
  return (request: Request, response: Response, next: NextFunction) => {
    const result = schema.safeParse({
      body: request.body,
      params: request.params,
      query: request.query
    });

    if (!result.success) {
      next(new HttpError(400, result.error.message));
      return;
    }

    next();
  };
}
