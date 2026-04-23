import type { Request, Response } from "express";
import { authSchema } from "./auth.schemas.js";
import { authService } from "./auth.service.js";

export const authController = {
  async register(request: Request, response: Response) {
    const payload = authSchema.parse(request.body);
    const result = await authService.register(payload.email, payload.password);
    return response.status(201).json(result);
  },

  async login(request: Request, response: Response) {
    const payload = authSchema.parse(request.body);
    const result = await authService.login(payload.email, payload.password);
    return response.status(200).json(result);
  },

  me(request: Request, response: Response) {
    return response.status(200).json({ user: request.user });
  }
};
