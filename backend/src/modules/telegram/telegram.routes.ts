import { Router } from "express";
import { asyncHandler } from "../../middleware/async-handler.js";
import { requireAuth } from "../auth/auth.middleware.js";
import { telegramController } from "./telegram.controller.js";

export const telegramRouter = Router();

telegramRouter.use(requireAuth);
telegramRouter.get("/status", asyncHandler(telegramController.getStatus));
telegramRouter.post("/link", asyncHandler(telegramController.createLink));
