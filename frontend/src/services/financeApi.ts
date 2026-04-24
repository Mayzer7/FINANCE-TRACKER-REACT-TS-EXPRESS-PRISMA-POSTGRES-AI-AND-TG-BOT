import type {
  BalanceTargetResult,
  Category,
  DashboardData,
  Goal,
  GoalChatMessage,
  Transaction,
  TransactionType,
} from "@/types";
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

  updateTransaction(
    token: string,
    transactionId: string,
    payload: { title: string; amount: number; categoryId: string; type: TransactionType }
  ) {
    return apiRequest<Transaction>(`/finance/transactions/${transactionId}`, {
      method: "PATCH",
      token,
      body: JSON.stringify({
        ...payload,
        type: payload.type.toUpperCase(),
      }),
    });
  },

  deleteTransaction(token: string, transactionId: string) {
    return apiRequest<void>(`/finance/transactions/${transactionId}`, {
      method: "DELETE",
      token,
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

  updateGoalCurrentAmount(token: string, goalId: string, currentAmount: number) {
    return apiRequest<Goal>(`/finance/goals/${goalId}`, {
      method: "PATCH",
      token,
      body: JSON.stringify({ currentAmount }),
    });
  },

  deleteGoal(token: string, goalId: string) {
    return apiRequest<void>(`/finance/goals/${goalId}`, {
      method: "DELETE",
      token,
    });
  },

  getGoalChat(token: string, goalId: string) {
    return apiRequest<{ messages: GoalChatMessage[] }>(`/finance/goals/${goalId}/chat`, {
      method: "GET",
      token,
    });
  },

  sendGoalChatMessage(token: string, goalId: string, content: string) {
    return apiRequest<{ userMessage: GoalChatMessage; assistantMessage: GoalChatMessage }>(
      `/finance/goals/${goalId}/chat`,
      {
        method: "POST",
        token,
        body: JSON.stringify({ content }),
      }
    );
  },

  setBalanceTarget(token: string, targetAmount: number) {
    return apiRequest<BalanceTargetResult>("/finance/balance-adjustments", {
      method: "POST",
      token,
      body: JSON.stringify({ targetAmount }),
    });
  },

  createCategory(token: string, payload: { name: string; color: string; type: TransactionType }) {
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
