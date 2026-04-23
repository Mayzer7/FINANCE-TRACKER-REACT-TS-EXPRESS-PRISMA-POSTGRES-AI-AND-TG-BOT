import type { Request, Response } from "express";
import { financeService } from "./finance.service.js";
import {
  balanceAdjustmentSchema,
  categorySchema,
  categoryUpdateSchema,
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

  async createCategory(request: Request, response: Response) {
    const payload = categorySchema.parse(request.body);
    const result = await financeService.createCategory(request.user!.sub, payload);
    return response.status(201).json(result);
  },

  async updateCategory(request: Request, response: Response) {
    const payload = categoryUpdateSchema.parse(request.body);
    const categoryId = Array.isArray(request.params.categoryId)
      ? request.params.categoryId[0]
      : request.params.categoryId;
    const result = await financeService.updateCategory(request.user!.sub, categoryId, payload);
    return response.status(200).json(result);
  },

  async deleteCategory(request: Request, response: Response) {
    const categoryId = Array.isArray(request.params.categoryId)
      ? request.params.categoryId[0]
      : request.params.categoryId;
    await financeService.deleteCategory(request.user!.sub, categoryId);
    return response.status(204).send();
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
