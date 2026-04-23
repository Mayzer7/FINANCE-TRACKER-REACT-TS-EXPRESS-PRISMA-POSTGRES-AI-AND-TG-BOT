import { Router } from "express";
import { asyncHandler } from "../../middleware/async-handler.js";
import { authController } from "./auth.controller.js";
import { requireAuth } from "./auth.middleware.js";

export const authRouter = Router();

authRouter.post("/register", asyncHandler(authController.register));
authRouter.post("/login", asyncHandler(authController.login));
authRouter.get("/me", requireAuth, authController.me);
