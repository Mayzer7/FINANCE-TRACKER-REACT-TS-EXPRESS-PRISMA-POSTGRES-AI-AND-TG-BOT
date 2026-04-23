import { useState, type ReactNode } from "react";
import { authStorage } from "@/services/authStorage";
import type { UserSession } from "@/types";
import { AuthContext } from "./AuthContext.shared";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<UserSession | null>(authStorage.getSession());

  const login = (email: string, password: string) => {
    const users = authStorage.getUsers();
    const user = users.find((item) => item.email === email);
    if (!user || user.password !== password) {
      return { ok: false, error: "Неверный email или пароль" };
    }

    const newSession: UserSession = { email, loggedInAt: new Date().toISOString() };
    authStorage.saveSession(newSession);
    setSession(newSession);
    return { ok: true };
  };

  const register = (email: string, password: string) => {
    const users = authStorage.getUsers();
    if (users.some((item) => item.email === email)) {
      return { ok: false, error: "Аккаунт с таким email уже существует" };
    }

    authStorage.saveUsers([...users, { email, password }]);
    const newSession: UserSession = { email, loggedInAt: new Date().toISOString() };
    authStorage.saveSession(newSession);
    setSession(newSession);
    return { ok: true };
  };

  const logout = () => {
    authStorage.clearSession();
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ session, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
