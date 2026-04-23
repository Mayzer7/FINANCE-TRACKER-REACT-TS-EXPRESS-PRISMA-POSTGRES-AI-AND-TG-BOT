import { createContext } from "react";
import type { FinanceState } from "@/services/mockFinanceStore";
import type { TransactionType } from "@/types";

export type FinanceContextValue = FinanceState & {
  addTransaction: (payload: {
    title: string;
    amount: number;
    categoryId: string;
    type: TransactionType;
  }) => void;
  addGoal: (payload: {
    title: string;
    description: string;
    targetAmount: number;
    currentAmount: number;
  }) => void;
  contributeToGoal: (goalId: string, amount: number) => void;
  getSummary: () => { income: number; expenses: number; balance: number };
};

export const FinanceContext = createContext<FinanceContextValue | undefined>(undefined);
