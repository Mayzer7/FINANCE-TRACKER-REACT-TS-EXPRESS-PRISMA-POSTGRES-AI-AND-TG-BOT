import { useEffect, useState, type ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { ApiError } from "@/services/api";
import { financeApi } from "@/services/financeApi";
import type { DashboardData } from "@/types";
import { emptyDashboard, FinanceContext, type FinanceContextValue } from "./FinanceContext.shared";

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
      const message =
        errorValue instanceof ApiError ? errorValue.message : "Не удалось загрузить данные";
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
        const message =
          errorValue instanceof ApiError ? errorValue.message : "Не удалось загрузить данные";
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
      return { ok: false, error: "Сессия не найдена" };
    }

    try {
      await financeApi.createTransaction(session.token, payload);
      await refresh();
      return { ok: true };
    } catch (errorValue) {
      return {
        ok: false,
        error: errorValue instanceof ApiError ? errorValue.message : "Не удалось добавить операцию",
      };
    }
  };

  const addGoal: FinanceContextValue["addGoal"] = async (payload) => {
    if (!session?.token) {
      return { ok: false, error: "Сессия не найдена" };
    }

    try {
      await financeApi.createGoal(session.token, payload);
      await refresh();
      return { ok: true };
    } catch (errorValue) {
      return {
        ok: false,
        error: errorValue instanceof ApiError ? errorValue.message : "Не удалось создать цель",
      };
    }
  };

  const createCategory: FinanceContextValue["createCategory"] = async (payload) => {
    if (!session?.token) {
      return { ok: false, error: "Сессия не найдена" };
    }

    try {
      await financeApi.createCategory(session.token, payload);
      await refresh();
      return { ok: true };
    } catch (errorValue) {
      return {
        ok: false,
        error: errorValue instanceof ApiError ? errorValue.message : "Не удалось создать категорию",
      };
    }
  };

  const updateCategory: FinanceContextValue["updateCategory"] = async (categoryId, payload) => {
    if (!session?.token) {
      return { ok: false, error: "Сессия не найдена" };
    }

    try {
      await financeApi.updateCategory(session.token, categoryId, payload);
      await refresh();
      return { ok: true };
    } catch (errorValue) {
      return {
        ok: false,
        error:
          errorValue instanceof ApiError ? errorValue.message : "Не удалось обновить категорию",
      };
    }
  };

  const deleteCategory: FinanceContextValue["deleteCategory"] = async (categoryId) => {
    if (!session?.token) {
      return { ok: false, error: "Сессия не найдена" };
    }

    try {
      await financeApi.deleteCategory(session.token, categoryId);
      await refresh();
      return { ok: true };
    } catch (errorValue) {
      return {
        ok: false,
        error: errorValue instanceof ApiError ? errorValue.message : "Не удалось удалить категорию",
      };
    }
  };

  const setBalanceTarget: FinanceContextValue["setBalanceTarget"] = async (targetAmount) => {
    if (!session?.token) {
      return { ok: false, error: "Сессия не найдена" };
    }

    try {
      await financeApi.setBalanceTarget(session.token, targetAmount);
      await refresh();
      return { ok: true };
    } catch (errorValue) {
      return {
        ok: false,
        error:
          errorValue instanceof ApiError
            ? errorValue.message
            : "Не удалось обновить текущий баланс",
      };
    }
  };

  const contributeToGoal: FinanceContextValue["contributeToGoal"] = async (goalId, amount) => {
    if (!session?.token) {
      return { ok: false, error: "Сессия не найдена" };
    }

    try {
      await financeApi.contributeToGoal(session.token, goalId, amount);
      await refresh();
      return { ok: true };
    } catch (errorValue) {
      return {
        ok: false,
        error: errorValue instanceof ApiError ? errorValue.message : "Не удалось пополнить цель",
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
    addGoal,
    createCategory,
    updateCategory,
    deleteCategory,
    setBalanceTarget,
    contributeToGoal,
    getSummary,
  };

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}
