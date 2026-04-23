import { Router } from "express";
import { asyncHandler } from "../../middleware/async-handler.js";
import { requireAuth } from "../auth/auth.middleware.js";
import { financeController } from "./finance.controller.js";

export const financeRouter = Router();

financeRouter.use(requireAuth);
financeRouter.get("/dashboard", asyncHandler(financeController.getDashboard));
financeRouter.post("/transactions", asyncHandler(financeController.createTransaction));
financeRouter.post("/goals", asyncHandler(financeController.createGoal));
financeRouter.post("/goals/:goalId/contributions", asyncHandler(financeController.contributeToGoal));
