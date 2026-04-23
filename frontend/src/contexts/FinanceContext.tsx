import { useState, type ReactNode } from "react";
import { mockFinanceStore, type FinanceState } from "@/services/mockFinanceStore";
import { FinanceContext, type FinanceContextValue } from "./FinanceContext.shared";

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<FinanceState>(mockFinanceStore.load);

  const addTransaction: FinanceContextValue["addTransaction"] = (payload) => {
    setState((prev) => {
      const next: FinanceState = {
        ...prev,
        transactions: [
          {
            id: `tx-${Date.now()}`,
            title: payload.title,
            amount: payload.amount,
            categoryId: payload.categoryId,
            type: payload.type,
            createdAt: new Date().toISOString(),
          },
          ...prev.transactions,
        ],
      };
      mockFinanceStore.save(next);
      return next;
    });
  };

  const addGoal: FinanceContextValue["addGoal"] = (payload) => {
    setState((prev) => {
      const next: FinanceState = {
        ...prev,
        goals: [
          {
            id: `goal-${Date.now()}`,
            title: payload.title,
            description: payload.description,
            targetAmount: payload.targetAmount,
            currentAmount: payload.currentAmount,
          },
          ...prev.goals,
        ],
      };
      mockFinanceStore.save(next);
      return next;
    });
  };

  const contributeToGoal: FinanceContextValue["contributeToGoal"] = (goalId, amount) => {
    setState((prev) => {
      const next: FinanceState = {
        ...prev,
        goals: prev.goals.map((goal) =>
          goal.id !== goalId
            ? goal
            : {
                ...goal,
                currentAmount: Math.min(goal.targetAmount, goal.currentAmount + amount),
              }
        ),
      };
      mockFinanceStore.save(next);
      return next;
    });
  };

  const getSummary = () => {
    let income = 0;
    let expenses = 0;

    state.transactions.forEach((transaction) => {
      if (transaction.type === "income") {
        income += transaction.amount;
      } else {
        expenses += transaction.amount;
      }
    });

    return { income, expenses, balance: income - expenses };
  };

  const value: FinanceContextValue = {
    ...state,
    addTransaction,
    addGoal,
    contributeToGoal,
    getSummary,
  };

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}
