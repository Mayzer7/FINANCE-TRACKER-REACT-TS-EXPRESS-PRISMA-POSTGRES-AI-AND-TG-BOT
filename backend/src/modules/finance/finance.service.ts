import { Prisma } from "@prisma/client";
import { HttpError } from "../../lib/http-error.js";
import { prisma } from "../../lib/prisma.js";
import { serializeCategory, serializeGoal, serializeTransaction } from "./finance.serializer.js";

export const financeService = {
  async getDashboard(userId: string) {
    const [categories, transactions, goals] = await Promise.all([
      prisma.category.findMany({
        where: { userId },
        orderBy: [{ type: "asc" }, { name: "asc" }],
      }),
      prisma.transaction.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      }),
      prisma.goal.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const summary = transactions.reduce(
      (acc, transaction) => {
        const amount = Number(transaction.amount);
        if (transaction.type === "INCOME") {
          acc.income += amount;
        } else {
          acc.expenses += amount;
        }
        acc.balance = acc.income - acc.expenses;
        return acc;
      },
      { income: 0, expenses: 0, balance: 0 }
    );

    return {
      summary,
      categories: categories.map(serializeCategory),
      transactions: transactions.map(serializeTransaction),
      goals: goals.map(serializeGoal),
    };
  },

  async createTransaction(
    userId: string,
    payload: { title: string; amount: number; type: "EXPENSE" | "INCOME"; categoryId: string }
  ) {
    const category = await prisma.category.findFirst({
      where: { id: payload.categoryId, userId, type: payload.type },
    });

    if (!category) {
      throw new HttpError(404, "Категория не найдена");
    }

    const transaction = await prisma.transaction.create({
      data: {
        title: payload.title,
        amount: new Prisma.Decimal(payload.amount),
        type: payload.type,
        categoryId: payload.categoryId,
        userId,
      },
    });

    return serializeTransaction(transaction);
  },

  async createGoal(
    userId: string,
    payload: { title: string; description: string; targetAmount: number; currentAmount: number }
  ) {
    const goal = await prisma.goal.create({
      data: {
        userId,
        title: payload.title,
        description: payload.description,
        targetAmount: new Prisma.Decimal(payload.targetAmount),
        currentAmount: new Prisma.Decimal(payload.currentAmount),
      },
    });

    return serializeGoal(goal);
  },

  async contributeToGoal(userId: string, goalId: string, amount: number) {
    const existingGoal = await prisma.goal.findFirst({ where: { id: goalId, userId } });
    if (!existingGoal) {
      throw new HttpError(404, "Цель не найдена");
    }

    const nextCurrentAmount = Math.min(
      Number(existingGoal.targetAmount),
      Number(existingGoal.currentAmount) + amount
    );

    const goal = await prisma.goal.update({
      where: { id: goalId },
      data: {
        currentAmount: new Prisma.Decimal(nextCurrentAmount),
      },
    });

    return serializeGoal(goal);
  },
};
