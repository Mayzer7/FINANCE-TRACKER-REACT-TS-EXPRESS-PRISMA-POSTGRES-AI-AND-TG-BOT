import type { Request, Response } from "express";
import { telegramService } from "./telegram.service.js";

export const telegramController = {
  async getStatus(request: Request, response: Response) {
    const result = await telegramService.getStatus(request.user!.sub);
    return response.status(200).json(result);
  },

  async createLink(request: Request, response: Response) {
    const result = await telegramService.createLink(request.user!.sub);
    return response.status(201).json(result);
  },
};
