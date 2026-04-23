import { initialCategories, initialGoals, initialTransactions } from "@/data/mockData";
import type { Category, Goal, Transaction } from "@/types";

const STORAGE_KEY = "aura_finance_data";

export type FinanceState = {
  categories: Category[];
  goals: Goal[];
  transactions: Transaction[];
};

const fallbackState: FinanceState = {
  categories: initialCategories,
  goals: initialGoals,
  transactions: initialTransactions,
};

export const mockFinanceStore = {
  load(): FinanceState {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return fallbackState;
    }
    try {
      return JSON.parse(raw) as FinanceState;
    } catch {
      return fallbackState;
    }
  },

  save(state: FinanceState) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  },
};
