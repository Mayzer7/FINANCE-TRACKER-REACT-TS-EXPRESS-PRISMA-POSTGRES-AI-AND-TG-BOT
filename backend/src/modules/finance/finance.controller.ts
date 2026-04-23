import type { Request, Response } from "express";
import { financeService } from "./finance.service.js";
import {
  balanceAdjustmentSchema,
  goalContributionSchema,
  goalSchema,
  transactionSchema,
} from "./finance.schemas.js";

export const financeController = {
  async getDashboard(request: Request, response: Response) {
    const result = await financeService.getDashboard(request.user!.sub);
    return response.status(200).json(result);
  },

  async createTransaction(request: Request, response: Response) {
    const payload = transactionSchema.parse(request.body);
    const result = await financeService.createTransaction(request.user!.sub, payload);
    return response.status(201).json(result);
  },

  async createGoal(request: Request, response: Response) {
    const payload = goalSchema.parse(request.body);
    const result = await financeService.createGoal(request.user!.sub, payload);
    return response.status(201).json(result);
  },

  async setBalanceTarget(request: Request, response: Response) {
    const payload = balanceAdjustmentSchema.parse(request.body);
    const result = await financeService.setBalanceTarget(request.user!.sub, payload.targetAmount);
    return response.status(201).json(result);
  },

  async contributeToGoal(request: Request, response: Response) {
    const payload = goalContributionSchema.parse(request.body);
    const goalId = Array.isArray(request.params.goalId)
      ? request.params.goalId[0]
      : request.params.goalId;
    const result = await financeService.contributeToGoal(
      request.user!.sub,
      goalId,
      payload.amount
    );
    return response.status(200).json(result);
  },
};
