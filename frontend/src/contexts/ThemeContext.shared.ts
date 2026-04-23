import { createContext } from "react";
import type { ThemeMode } from "@/types";

export type ThemeContextValue = {
  theme: ThemeMode;
  toggleTheme: () => void;
};

export const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);
