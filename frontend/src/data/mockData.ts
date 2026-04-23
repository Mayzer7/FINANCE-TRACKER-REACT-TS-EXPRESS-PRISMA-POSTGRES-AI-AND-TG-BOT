import type { Category, Goal, Transaction } from "../types";

export const initialCategories: Category[] = [
  { id: "cat-home", name: "Жилье", color: "#58ABD2", type: "expense" },
  { id: "cat-food", name: "Еда", color: "#7DB89A", type: "expense" },
  { id: "cat-clothes", name: "Одежда", color: "#CAA196", type: "expense" },
  { id: "cat-edu", name: "Образование", color: "#8770C8", type: "expense" },
  { id: "cat-transport", name: "Транспорт", color: "#D0AA63", type: "expense" },
  { id: "cat-salary", name: "Зарплата", color: "#78C9A1", type: "income" },
  { id: "cat-freelance", name: "Фриланс", color: "#67AEEA", type: "income" },
  { id: "cat-gift", name: "Подарок", color: "#BBA7EA", type: "income" },
];

export const initialTransactions: Transaction[] = [
  {
    id: "tx-01",
    title: "Продукты в Перекрестке",
    amount: 3500,
    categoryId: "cat-food",
    createdAt: "2026-04-22T20:18:00.000Z",
    type: "expense",
  },
  {
    id: "tx-02",
    title: "Аренда квартиры",
    amount: 55000,
    categoryId: "cat-home",
    createdAt: "2026-04-20T20:18:00.000Z",
    type: "expense",
  },
  {
    id: "tx-03",
    title: "Магазин ВкусВилл",
    amount: 8200,
    categoryId: "cat-food",
    createdAt: "2026-04-20T20:18:00.000Z",
    type: "expense",
  },
  {
    id: "tx-04",
    title: "Такси",
    amount: 2200,
    categoryId: "cat-transport",
    createdAt: "2026-04-19T20:18:00.000Z",
    type: "expense",
  },
  {
    id: "tx-05",
    title: "Доставка ужина",
    amount: 3450,
    categoryId: "cat-food",
    createdAt: "2026-04-18T20:18:00.000Z",
    type: "expense",
  },
  {
    id: "tx-06",
    title: "Зарплата за апрель",
    amount: 180000,
    categoryId: "cat-salary",
    createdAt: "2026-04-21T20:18:00.000Z",
    type: "income",
  },
  {
    id: "tx-07",
    title: "Проект для клиента X",
    amount: 45000,
    categoryId: "cat-freelance",
    createdAt: "2026-04-14T20:18:00.000Z",
    type: "income",
  },
  {
    id: "tx-08",
    title: "Подарок от семьи",
    amount: 17500,
    categoryId: "cat-gift",
    createdAt: "2026-04-09T20:18:00.000Z",
    type: "income",
  },
];

export const initialGoals: Goal[] = [
  {
    id: "goal-01",
    title: "Поездка в Японию",
    description: "Две недели в Токио и Киото весной",
    targetAmount: 450000,
    currentAmount: 127000,
  },
  {
    id: "goal-02",
    title: "Подушка безопасности",
    description: "Шесть месячных расходов на счету",
    targetAmount: 600000,
    currentAmount: 210000,
  },
  {
    id: "goal-03",
    title: "Новый MacBook",
    description: "MacBook Pro 14 M4 для работы",
    targetAmount: 280000,
    currentAmount: 95000,
  },
];
