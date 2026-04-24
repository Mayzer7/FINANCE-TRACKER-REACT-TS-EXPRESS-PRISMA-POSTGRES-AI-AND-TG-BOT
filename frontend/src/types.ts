export type TransactionType = "expense" | "income";

export type ThemeMode = "light" | "dark";

export type Category = {
  id: string;
  name: string;
  color: string;
  type: TransactionType;
};

export type Transaction = {
  id: string;
  title: string;
  amount: number;
  categoryId: string;
  createdAt: string;
  type: TransactionType;
};

export type Goal = {
  id: string;
  title: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
};

export type GoalChatMessage = {
  id: string;
  goalId: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
};

export type Summary = {
  income: number;
  expenses: number;
  balance: number;
};

export type DashboardData = {
  categories: Category[];
  goals: Goal[];
  transactions: Transaction[];
  summary: Summary;
};

export type BalanceTargetResult = {
  balance: number;
};

export type AuthUser = {
  sub: string;
  email: string;
};

export type UserSession = {
  userId: string;
  email: string;
  token: string;
  loggedInAt: string;
};
