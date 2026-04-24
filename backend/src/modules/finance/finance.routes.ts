import { Router } from "express";
import { asyncHandler } from "../../middleware/async-handler.js";
import { requireAuth } from "../auth/auth.middleware.js";
import { financeController } from "./finance.controller.js";

export const financeRouter = Router();

financeRouter.use(requireAuth);
financeRouter.get("/dashboard", asyncHandler(financeController.getDashboard));
financeRouter.post("/categories", asyncHandler(financeController.createCategory));
financeRouter.patch("/categories/:categoryId", asyncHandler(financeController.updateCategory));
financeRouter.delete("/categories/:categoryId", asyncHandler(financeController.deleteCategory));
financeRouter.post("/transactions", asyncHandler(financeController.createTransaction));
financeRouter.patch("/transactions/:transactionId", asyncHandler(financeController.updateTransaction));
financeRouter.delete("/transactions/:transactionId", asyncHandler(financeController.deleteTransaction));
financeRouter.post("/goals", asyncHandler(financeController.createGoal));
financeRouter.patch("/goals/:goalId", asyncHandler(financeController.updateGoal));
financeRouter.delete("/goals/:goalId", asyncHandler(financeController.deleteGoal));
financeRouter.get("/goals/:goalId/chat", asyncHandler(financeController.getGoalChat));
financeRouter.post("/goals/:goalId/chat", asyncHandler(financeController.sendGoalChatMessage));
financeRouter.post("/balance-adjustments", asyncHandler(financeController.setBalanceTarget));
financeRouter.post("/goals/:goalId/contributions", asyncHandler(financeController.contributeToGoal));
