import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";
import { HttpError } from "../../lib/http-error.js";
import type { JwtPayload } from "./auth.types.js";

export function requireAuth(request: Request, _response: Response, next: NextFunction) {
  const authHeader = request.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return next(new HttpError(401, "Требуется авторизация"));
  }

  const token = authHeader.replace("Bearer ", "");
  try {
    request.user = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    return next();
  } catch {
    return next(new HttpError(401, "Недействительный токен"));
  }
}
