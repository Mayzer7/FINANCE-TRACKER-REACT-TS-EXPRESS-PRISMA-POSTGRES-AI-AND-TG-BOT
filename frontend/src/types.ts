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

export type UserRecord = {
  email: string;
  password: string;
};

export type UserSession = {
  email: string;
  loggedInAt: string;
};
