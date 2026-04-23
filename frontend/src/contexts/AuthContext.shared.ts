import { createContext } from "react";
import type { UserSession } from "@/types";

export type AuthActionResult = {
  ok: boolean;
  error?: string;
};

export type AuthContextValue = {
  session: UserSession | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthActionResult>;
  register: (email: string, password: string) => Promise<AuthActionResult>;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
