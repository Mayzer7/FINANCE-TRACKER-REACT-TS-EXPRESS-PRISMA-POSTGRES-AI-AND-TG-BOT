import type { Request, Response } from "express";
import { financeService } from "./finance.service.js";
import {
  balanceAdjustmentSchema,
  categorySchema,
  categoryUpdateSchema,
  goalChatMessageSchema,
  goalContributionSchema,
  goalSchema,
  transactionSchema,
} from "./finance.schemas.js";

function getRouteParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value ?? "";
}

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

  async deleteGoal(request: Request, response: Response) {
    const goalId = getRouteParam(request.params.goalId);
    await financeService.deleteGoal(request.user!.sub, goalId);
    return response.status(204).send();
  },

  async getGoalChat(request: Request, response: Response) {
    const goalId = getRouteParam(request.params.goalId);
    const result = await financeService.getGoalChat(request.user!.sub, goalId);
    return response.status(200).json(result);
  },

  async sendGoalChatMessage(request: Request, response: Response) {
    const goalId = getRouteParam(request.params.goalId);
    const payload = goalChatMessageSchema.parse(request.body);
    const result = await financeService.sendGoalChatMessage(request.user!.sub, goalId, payload.content);
    return response.status(201).json(result);
  },

  async createCategory(request: Request, response: Response) {
    const payload = categorySchema.parse(request.body);
    const result = await financeService.createCategory(request.user!.sub, payload);
    return response.status(201).json(result);
  },

  async updateCategory(request: Request, response: Response) {
    const payload = categoryUpdateSchema.parse(request.body);
    const categoryId = getRouteParam(request.params.categoryId);
    const result = await financeService.updateCategory(request.user!.sub, categoryId, payload);
    return response.status(200).json(result);
  },

  async deleteCategory(request: Request, response: Response) {
    const categoryId = getRouteParam(request.params.categoryId);
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
    const goalId = getRouteParam(request.params.goalId);
    const result = await financeService.contributeToGoal(request.user!.sub, goalId, payload.amount);
    return response.status(200).json(result);
  },
};
