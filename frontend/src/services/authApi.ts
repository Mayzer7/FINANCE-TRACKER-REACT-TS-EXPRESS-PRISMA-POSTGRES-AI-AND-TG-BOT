import type { AuthUser } from "@/types";
import { apiRequest } from "./api";

type AuthResponse = {
  token: string;
  user: AuthUser;
};

export const authApi = {
  login(email: string, password: string) {
    return apiRequest<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },
  register(email: string, password: string) {
    return apiRequest<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },
  me(token: string) {
    return apiRequest<{ user: AuthUser }>("/auth/me", {
      method: "GET",
      token,
    });
  },
};
