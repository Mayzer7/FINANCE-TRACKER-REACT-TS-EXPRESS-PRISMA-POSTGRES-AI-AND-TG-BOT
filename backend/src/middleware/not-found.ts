import type { Request, Response } from "express";

export function notFoundHandler(request: Request, response: Response) {
  response.status(404).json({
    message: `Маршрут ${request.method} ${request.originalUrl} не найден`
  });
}
