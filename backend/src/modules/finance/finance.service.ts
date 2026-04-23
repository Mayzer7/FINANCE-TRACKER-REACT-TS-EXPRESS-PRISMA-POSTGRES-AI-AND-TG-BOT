import { Prisma } from "@prisma/client";
import { HttpError } from "../../lib/http-error.js";
import { prisma } from "../../lib/prisma.js";

const toNumber = (value: Prisma.Decimal) => Number(value);

export const financeService = {
  async getDashboard(userId: string) {
    const [categories, transactions, goals] = await Promise.all([
      prisma.category.findMany({
        where: { userId },
        orderBy: [{ type: "asc" }, { name: "asc" }]
      }),
      prisma.transaction.findMany({
        where: { userId },
        include: { category: true },
        orderBy: { createdAt: "desc" }
      }),
      prisma.goal.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" }
      })
    ]);

    const summary = transactions.reduce(
      (
        acc: { income: number; expenses: number; balance: number },
        transaction: (typeof transactions)[number]
      ) => {
        const amount = toNumber(transaction.amount);
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
      categories,
      transactions: transactions.map((transaction: (typeof transactions)[number]) => ({
        ...transaction,
        amount: toNumber(transaction.amount)
      })),
      goals: goals.map((goal: (typeof goals)[number]) => ({
        ...goal,
        targetAmount: toNumber(goal.targetAmount),
        currentAmount: toNumber(goal.currentAmount)
      }))
    };
  },

  async createTransaction(
    userId: string,
    payload: { title: string; amount: number; type: "EXPENSE" | "INCOME"; categoryId: string }
  ) {
    const category = await prisma.category.findFirst({
      where: { id: payload.categoryId, userId, type: payload.type }
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
        userId
      },
      include: { category: true }
    });

    return {
      ...transaction,
      amount: toNumber(transaction.amount)
    };
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
        currentAmount: new Prisma.Decimal(payload.currentAmount)
      }
    });

    return {
      ...goal,
      targetAmount: toNumber(goal.targetAmount),
      currentAmount: toNumber(goal.currentAmount)
    };
  },

  async contributeToGoal(userId: string, goalId: string, amount: number) {
    const existingGoal = await prisma.goal.findFirst({ where: { id: goalId, userId } });
    if (!existingGoal) {
      throw new HttpError(404, "Цель не найдена");
    }

    const nextCurrentAmount = Math.min(
      toNumber(existingGoal.targetAmount),
      toNumber(existingGoal.currentAmount) + amount
    );

    const goal = await prisma.goal.update({
      where: { id: goalId },
      data: {
        currentAmount: new Prisma.Decimal(nextCurrentAmount)
      }
    });

    return {
      ...goal,
      targetAmount: toNumber(goal.targetAmount),
      currentAmount: toNumber(goal.currentAmount)
    };
  }
};
