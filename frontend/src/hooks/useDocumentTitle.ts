import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const APP_NAME = "Aura Finance";

const pageTitles: Record<string, string> = {
  "/": "Главная",
  "/login": "Вход",
  "/register": "Регистрация",
  "/app/expenses": "Расходы",
  "/app/income": "Доходы",
  "/app/transactions": "Все транзакции",
  "/app/goals": "Цели",
  "/app/categories": "Категории",
  "/app/profile": "Профиль",
};

function normalizePathname(pathname: string) {
  if (pathname === "/") {
    return pathname;
  }

  return pathname.replace(/\/+$/, "");
}

function resolveDocumentTitle(pathname: string) {
  const normalizedPathname = normalizePathname(pathname);
  const pageTitle = pageTitles[normalizedPathname];

  return pageTitle ? `${pageTitle} | ${APP_NAME}` : APP_NAME;
}

export function useDocumentTitle() {
  const location = useLocation();

  useEffect(() => {
    document.title = resolveDocumentTitle(location.pathname);
  }, [location.pathname]);
}
