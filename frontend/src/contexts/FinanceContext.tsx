import { useEffect, useState, type ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { ApiError } from "@/services/api";
import { financeApi } from "@/services/financeApi";
import type { DashboardData } from "@/types";
import { emptyDashboard, FinanceContext, type FinanceContextValue } from "./FinanceContext.shared";

const FALLBACK_MESSAGES = {
  load: "Не удалось загрузить данные",
  session: "Сессия не найдена",
  transaction: "Не удалось добавить операцию",
  transactionUpdate: "Не удалось обновить операцию",
  transactionDelete: "Не удалось удалить операцию",
  goal: "Не удалось создать цель",
  goalUpdate: "Не удалось обновить сумму цели",
  goalDelete: "Не удалось удалить цель",
  goalChatLoad: "Не удалось загрузить историю чата",
  goalChatSend: "Не удалось получить ответ AI",
  categoryCreate: "Не удалось создать категорию",
  categoryUpdate: "Не удалось обновить категорию",
  categoryDelete: "Не удалось удалить категорию",
  balance: "Не удалось обновить текущий баланс",
  contribution: "Не удалось пополнить цель",
};

export function FinanceProvider({ children }: { children: ReactNode }) {
  const { session, logout, isLoading: isAuthLoading } = useAuth();
  const [state, setState] = useState<DashboardData>(emptyDashboard);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const refresh = async () => {
    if (!session?.token) {
      setState(emptyDashboard);
      setError("");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const dashboard = await financeApi.getDashboard(session.token);
      setState(dashboard);
    } catch (errorValue) {
      const message = errorValue instanceof ApiError ? errorValue.message : FALLBACK_MESSAGES.load;
      setError(message);
      if (errorValue instanceof ApiError && errorValue.status === 401) {
        logout();
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void (async () => {
      if (isAuthLoading) {
        return;
      }

      if (!session?.token) {
        setState(emptyDashboard);
        setError("");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError("");

      try {
        const dashboard = await financeApi.getDashboard(session.token);
        setState(dashboard);
      } catch (errorValue) {
        const message = errorValue instanceof ApiError ? errorValue.message : FALLBACK_MESSAGES.load;
        setError(message);
        if (errorValue instanceof ApiError && errorValue.status === 401) {
          logout();
        }
      } finally {
        setIsLoading(false);
      }
    })();
  }, [session?.token, isAuthLoading, logout]);

  const addTransaction: FinanceContextValue["addTransaction"] = async (payload) => {
    if (!session?.token) {
      return { ok: false, error: FALLBACK_MESSAGES.session };
    }

    try {
      await financeApi.createTransaction(session.token, payload);
      await refresh();
      return { ok: true };
    } catch (errorValue) {
      return {
        ok: false,
        error: errorValue instanceof ApiError ? errorValue.message : FALLBACK_MESSAGES.transaction,
      };
    }
  };

  const updateTransaction: FinanceContextValue["updateTransaction"] = async (transactionId, payload) => {
    if (!session?.token) {
      return { ok: false, error: FALLBACK_MESSAGES.session };
    }

    try {
      await financeApi.updateTransaction(session.token, transactionId, payload);
      await refresh();
      return { ok: true };
    } catch (errorValue) {
      return {
        ok: false,
        error: errorValue instanceof ApiError ? errorValue.message : FALLBACK_MESSAGES.transactionUpdate,
      };
    }
  };

  const deleteTransaction: FinanceContextValue["deleteTransaction"] = async (transactionId) => {
    if (!session?.token) {
      return { ok: false, error: FALLBACK_MESSAGES.session };
    }

    try {
      await financeApi.deleteTransaction(session.token, transactionId);
      await refresh();
      return { ok: true };
    } catch (errorValue) {
      return {
        ok: false,
        error: errorValue instanceof ApiError ? errorValue.message : FALLBACK_MESSAGES.transactionDelete,
      };
    }
  };

  const addGoal: FinanceContextValue["addGoal"] = async (payload) => {
    if (!session?.token) {
      return { ok: false, error: FALLBACK_MESSAGES.session };
    }

    try {
      await financeApi.createGoal(session.token, payload);
      await refresh();
      return { ok: true };
    } catch (errorValue) {
      return {
        ok: false,
        error: errorValue instanceof ApiError ? errorValue.message : FALLBACK_MESSAGES.goal,
      };
    }
  };

  const updateGoalCurrentAmount: FinanceContextValue["updateGoalCurrentAmount"] = async (
    goalId,
    currentAmount
  ) => {
    if (!session?.token) {
      return { ok: false, error: FALLBACK_MESSAGES.session };
    }

    try {
      await financeApi.updateGoalCurrentAmount(session.token, goalId, currentAmount);
      await refresh();
      return { ok: true };
    } catch (errorValue) {
      return {
        ok: false,
        error: errorValue instanceof ApiError ? errorValue.message : FALLBACK_MESSAGES.goalUpdate,
      };
    }
  };

  const deleteGoal: FinanceContextValue["deleteGoal"] = async (goalId) => {
    if (!session?.token) {
      return { ok: false, error: FALLBACK_MESSAGES.session };
    }

    try {
      await financeApi.deleteGoal(session.token, goalId);
      await refresh();
      return { ok: true };
    } catch (errorValue) {
      return {
        ok: false,
        error: errorValue instanceof ApiError ? errorValue.message : FALLBACK_MESSAGES.goalDelete,
      };
    }
  };

  const getGoalChat: FinanceContextValue["getGoalChat"] = async (goalId) => {
    if (!session?.token) {
      return { ok: false, error: FALLBACK_MESSAGES.session };
    }

    try {
      const result = await financeApi.getGoalChat(session.token, goalId);
      return { ok: true, messages: result.messages };
    } catch (errorValue) {
      return {
        ok: false,
        error: errorValue instanceof ApiError ? errorValue.message : FALLBACK_MESSAGES.goalChatLoad,
      };
    }
  };

  const sendGoalChatMessage: FinanceContextValue["sendGoalChatMessage"] = async (goalId, content) => {
    if (!session?.token) {
      return { ok: false, error: FALLBACK_MESSAGES.session };
    }

    try {
      const result = await financeApi.sendGoalChatMessage(session.token, goalId, content);
      return {
        ok: true,
        messages: [result.userMessage, result.assistantMessage],
      };
    } catch (errorValue) {
      return {
        ok: false,
        error: errorValue instanceof ApiError ? errorValue.message : FALLBACK_MESSAGES.goalChatSend,
      };
    }
  };

  const createCategory: FinanceContextValue["createCategory"] = async (payload) => {
    if (!session?.token) {
      return { ok: false, error: FALLBACK_MESSAGES.session };
    }

    try {
      await financeApi.createCategory(session.token, payload);
      await refresh();
      return { ok: true };
    } catch (errorValue) {
      return {
        ok: false,
        error: errorValue instanceof ApiError ? errorValue.message : FALLBACK_MESSAGES.categoryCreate,
      };
    }
  };

  const updateCategory: FinanceContextValue["updateCategory"] = async (categoryId, payload) => {
    if (!session?.token) {
      return { ok: false, error: FALLBACK_MESSAGES.session };
    }

    try {
      await financeApi.updateCategory(session.token, categoryId, payload);
      await refresh();
      return { ok: true };
    } catch (errorValue) {
      return {
        ok: false,
        error: errorValue instanceof ApiError ? errorValue.message : FALLBACK_MESSAGES.categoryUpdate,
      };
    }
  };

  const deleteCategory: FinanceContextValue["deleteCategory"] = async (categoryId) => {
    if (!session?.token) {
      return { ok: false, error: FALLBACK_MESSAGES.session };
    }

    try {
      await financeApi.deleteCategory(session.token, categoryId);
      await refresh();
      return { ok: true };
    } catch (errorValue) {
      return {
        ok: false,
        error: errorValue instanceof ApiError ? errorValue.message : FALLBACK_MESSAGES.categoryDelete,
      };
    }
  };

  const setBalanceTarget: FinanceContextValue["setBalanceTarget"] = async (targetAmount) => {
    if (!session?.token) {
      return { ok: false, error: FALLBACK_MESSAGES.session };
    }

    try {
      await financeApi.setBalanceTarget(session.token, targetAmount);
      await refresh();
      return { ok: true };
    } catch (errorValue) {
      return {
        ok: false,
        error: errorValue instanceof ApiError ? errorValue.message : FALLBACK_MESSAGES.balance,
      };
    }
  };

  const contributeToGoal: FinanceContextValue["contributeToGoal"] = async (goalId, amount) => {
    if (!session?.token) {
      return { ok: false, error: FALLBACK_MESSAGES.session };
    }

    try {
      await financeApi.contributeToGoal(session.token, goalId, amount);
      await refresh();
      return { ok: true };
    } catch (errorValue) {
      return {
        ok: false,
        error: errorValue instanceof ApiError ? errorValue.message : FALLBACK_MESSAGES.contribution,
      };
    }
  };

  const getSummary = () => state.summary;

  const value: FinanceContextValue = {
    ...state,
    isLoading,
    error,
    refresh,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addGoal,
    updateGoalCurrentAmount,
    deleteGoal,
    getGoalChat,
    sendGoalChatMessage,
    createCategory,
    updateCategory,
    deleteCategory,
    setBalanceTarget,
    contributeToGoal,
    getSummary,
  };

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}
