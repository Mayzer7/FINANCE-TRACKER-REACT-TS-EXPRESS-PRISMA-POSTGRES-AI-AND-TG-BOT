import { createContext } from "react";
import type { UserSession } from "@/types";

export type AuthContextValue = {
  session: UserSession | null;
  login: (email: string, password: string) => { ok: boolean; error?: string };
  register: (email: string, password: string) => { ok: boolean; error?: string };
  logout: () => void;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
