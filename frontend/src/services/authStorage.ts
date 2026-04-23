import type { UserRecord, UserSession } from "../types";

const USERS_KEY = "aura_users";
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
  getUsers(): UserRecord[] {
    return parseJSON<UserRecord[]>(localStorage.getItem(USERS_KEY), []);
  },
  saveUsers(users: UserRecord[]) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  },
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
