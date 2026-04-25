import { apiRequest } from "./api";

export type TelegramStatusResponse = {
  connected: boolean;
  username: string | null;
  firstName: string | null;
  linkedAt: string | null;
  label: string;
};

export type TelegramLinkResponse = {
  deepLink: string;
  expiresAt: string;
};

export const telegramApi = {
  getStatus(token: string) {
    return apiRequest<TelegramStatusResponse>("/telegram/status", {
      method: "GET",
      token,
    });
  },

  createLink(token: string) {
    return apiRequest<TelegramLinkResponse>("/telegram/link", {
      method: "POST",
      token,
      body: JSON.stringify({}),
    });
  },
};
