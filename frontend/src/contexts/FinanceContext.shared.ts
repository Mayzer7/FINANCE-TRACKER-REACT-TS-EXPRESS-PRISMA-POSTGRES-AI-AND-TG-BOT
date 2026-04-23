import { createContext } from "react";
import type { DashboardData } from "@/types";

export type FinanceContextValue = DashboardData & {
  isLoading: boolean;
  error: string;
  refresh: () => Promise<void>;
  addTransaction: (payload: {
    title: string;
    amount: number;
    categoryId: string;
    type: "expense" | "income";
  }) => Promise<{ ok: boolean; error?: string }>;
  addGoal: (payload: {
    title: string;
    description: string;
    targetAmount: number;
    currentAmount: number;
  }) => Promise<{ ok: boolean; error?: string }>;
  createCategory: (payload: {
    name: string;
    color: string;
    type: "expense" | "income";
  }) => Promise<{ ok: boolean; error?: string }>;
  updateCategory: (
    categoryId: string,
    payload: { name: string; color: string; type: "expense" | "income" }
  ) => Promise<{ ok: boolean; error?: string }>;
  deleteCategory: (categoryId: string) => Promise<{ ok: boolean; error?: string }>;
  setBalanceTarget: (targetAmount: number) => Promise<{ ok: boolean; error?: string }>;
  contributeToGoal: (goalId: string, amount: number) => Promise<{ ok: boolean; error?: string }>;
  getSummary: () => DashboardData["summary"];
};

export const emptyDashboard: DashboardData = {
  categories: [],
  goals: [],
  transactions: [],
  summary: {
    income: 0,
    expenses: 0,
    balance: 0,
  },
};

export const FinanceContext = createContext<FinanceContextValue | undefined>(undefined);
