import type { NextFunction, Request, Response } from 'express';

export function notFound(request: Request, response: Response, next: NextFunction) {
  response.status(404).json({ message: `Route not found: ${request.method} ${request.originalUrl}` });
  next();
}
