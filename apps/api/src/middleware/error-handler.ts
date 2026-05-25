import type { NextFunction, Request, Response } from 'express';
import { HttpError } from '../utils/http-error';

export function errorHandler(error: unknown, request: Request, response: Response, next: NextFunction) {
  if (response.headersSent) {
    next(error);
    return;
  }

  if (error instanceof HttpError) {
    response.status(error.statusCode).json({ message: error.message });
    return;
  }

  const message = error instanceof Error ? error.message : 'Unexpected server error';
  response.status(500).json({ message, path: request.originalUrl });
}
