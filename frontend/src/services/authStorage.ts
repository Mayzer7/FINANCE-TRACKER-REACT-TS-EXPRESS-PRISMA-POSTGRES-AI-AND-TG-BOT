import type { UserSession } from "@/types";

const SESSION_KEY = "aura_session";

function parseJSON<T>(value: string | null, fallback: T): T {
  if (!value) {
    return fallback;
  }
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export const authStorage = {
  getSession(): UserSession | null {
    return parseJSON<UserSession | null>(localStorage.getItem(SESSION_KEY), null);
  },
  saveSession(session: UserSession) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  },
  clearSession() {
    localStorage.removeItem(SESSION_KEY);
  },
};
