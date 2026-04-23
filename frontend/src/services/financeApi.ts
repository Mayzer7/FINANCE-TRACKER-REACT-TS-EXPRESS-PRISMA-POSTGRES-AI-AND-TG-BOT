import type { BalanceTargetResult, Category, DashboardData, Goal, Transaction, TransactionType } from "@/types";
import { apiRequest } from "./api";

export const financeApi = {
  getDashboard(token: string) {
    return apiRequest<DashboardData>("/finance/dashboard", {
      method: "GET",
      token,
    });
  },
  createTransaction(
    token: string,
    payload: { title: string; amount: number; categoryId: string; type: TransactionType }
  ) {
    return apiRequest<Transaction>("/finance/transactions", {
      method: "POST",
      token,
      body: JSON.stringify({
        ...payload,
        type: payload.type.toUpperCase(),
      }),
    });
  },
  createGoal(
    token: string,
    payload: { title: string; description: string; targetAmount: number; currentAmount: number }
  ) {
    return apiRequest<Goal>("/finance/goals", {
      method: "POST",
      token,
      body: JSON.stringify(payload),
    });
  },
  setBalanceTarget(token: string, targetAmount: number) {
    return apiRequest<BalanceTargetResult>("/finance/balance-adjustments", {
      method: "POST",
      token,
      body: JSON.stringify({ targetAmount }),
    });
  },
  createCategory(
    token: string,
    payload: { name: string; color: string; type: TransactionType }
  ) {
    return apiRequest<Category>("/finance/categories", {
      method: "POST",
      token,
      body: JSON.stringify({
        ...payload,
        type: payload.type.toUpperCase(),
      }),
    });
  },
  updateCategory(
    token: string,
    categoryId: string,
    payload: { name: string; color: string; type: TransactionType }
  ) {
    return apiRequest<Category>(`/finance/categories/${categoryId}`, {
      method: "PATCH",
      token,
      body: JSON.stringify({
        ...payload,
        type: payload.type.toUpperCase(),
      }),
    });
  },
  deleteCategory(token: string, categoryId: string) {
    return apiRequest<void>(`/finance/categories/${categoryId}`, {
      method: "DELETE",
      token,
    });
  },
  contributeToGoal(token: string, goalId: string, amount: number) {
    return apiRequest<Goal>(`/finance/goals/${goalId}/contributions`, {
      method: "POST",
      token,
      body: JSON.stringify({ amount }),
    });
  },
};
