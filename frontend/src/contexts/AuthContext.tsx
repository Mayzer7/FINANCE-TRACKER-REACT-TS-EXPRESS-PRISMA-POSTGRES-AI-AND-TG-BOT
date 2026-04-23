import { useEffect, useState, type ReactNode } from "react";
import { authApi } from "@/services/authApi";
import { ApiError } from "@/services/api";
import { authStorage } from "@/services/authStorage";
import type { UserSession } from "@/types";
import { AuthContext } from "./AuthContext.shared";

function createSession(payload: { token: string; user: { sub: string; email: string } }): UserSession {
  return {
    userId: payload.user.sub,
    email: payload.user.email,
    token: payload.token,
    loggedInAt: new Date().toISOString(),
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [initialSession] = useState<UserSession | null>(() => authStorage.getSession());
  const [session, setSession] = useState<UserSession | null>(initialSession);
  const [isLoading, setIsLoading] = useState(Boolean(initialSession));

  useEffect(() => {
    if (!initialSession) {
      return;
    }

    void (async () => {
      try {
        const { user } = await authApi.me(initialSession.token);
        const nextSession: UserSession = {
          ...initialSession,
          userId: user.sub,
          email: user.email,
        };
        authStorage.saveSession(nextSession);
        setSession(nextSession);
      } catch {
        authStorage.clearSession();
        setSession(null);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [initialSession]);

  const login = async (email: string, password: string) => {
    try {
      const result = await authApi.login(email, password);
      const newSession = createSession(result);
      authStorage.saveSession(newSession);
      setSession(newSession);
      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof ApiError ? error.message : "Не удалось выполнить вход",
      };
    }
  };

  const register = async (email: string, password: string) => {
    try {
      const result = await authApi.register(email, password);
      const newSession = createSession(result);
      authStorage.saveSession(newSession);
      setSession(newSession);
      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof ApiError ? error.message : "Не удалось создать аккаунт",
      };
    }
  };

  const logout = () => {
    authStorage.clearSession();
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ session, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
