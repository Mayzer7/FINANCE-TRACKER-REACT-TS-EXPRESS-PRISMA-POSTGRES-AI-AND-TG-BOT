import { Prisma, type BalanceAdjustment, type Transaction } from "@prisma/client";
import { HttpError } from "../../lib/http-error.js";
import { prisma } from "../../lib/prisma.js";
import { serializeCategory, serializeGoal, serializeTransaction } from "./finance.serializer.js";

export const financeService = {
  async getDashboard(userId: string) {
    const [categories, transactions, goals, adjustments] = await Promise.all([
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
      prisma.balanceAdjustment.findMany({
        where: { userId },
        orderBy: { createdAt: "asc" },
      }),
    ]);

    const summaryBase = transactions.reduce(
      (acc: { income: number; expenses: number; balance: number }, transaction: Transaction) => {
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

    const adjustmentTotal = adjustments.reduce(
      (acc: number, adjustment: BalanceAdjustment) => acc + Number(adjustment.amount),
      0
    );

    return {
      summary: {
        ...summaryBase,
        balance: summaryBase.balance + adjustmentTotal,
      },
      categories: categories.map(serializeCategory),
      transactions: transactions.map(serializeTransaction),
      goals: goals.map(serializeGoal),
    };
  },

  async createCategory(
    userId: string,
    payload: { name: string; color: string; type: "EXPENSE" | "INCOME" }
  ) {
    try {
      const category = await prisma.category.create({
        data: {
          userId,
          name: payload.name,
          color: payload.color,
          type: payload.type,
        },
      });

      return serializeCategory(category);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new HttpError(409, "Категория с таким названием уже существует");
      }
      throw error;
    }
  },

  async updateCategory(
    userId: string,
    categoryId: string,
    payload: { name: string; color: string; type: "EXPENSE" | "INCOME" }
  ) {
    const existingCategory = await prisma.category.findFirst({
      where: { id: categoryId, userId },
      include: {
        transactions: {
          select: { id: true },
          take: 1,
        },
      },
    });

    if (!existingCategory) {
      throw new HttpError(404, "Категория не найдена");
    }

    if (
      existingCategory.type !== payload.type &&
      existingCategory.transactions.length > 0
    ) {
      throw new HttpError(409, "Нельзя менять тип категории, в которой уже есть операции");
    }

    try {
      const category = await prisma.category.update({
        where: { id: categoryId },
        data: {
          name: payload.name,
          color: payload.color,
          type: payload.type,
        },
      });

      return serializeCategory(category);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new HttpError(409, "Категория с таким названием уже существует");
      }
      throw error;
    }
  },

  async deleteCategory(userId: string, categoryId: string) {
    const existingCategory = await prisma.category.findFirst({
      where: { id: categoryId, userId },
      include: {
        transactions: {
          select: { id: true },
          take: 1,
        },
      },
    });

    if (!existingCategory) {
      throw new HttpError(404, "Категория не найдена");
    }

    if (existingCategory.transactions.length > 0) {
      throw new HttpError(409, "Нельзя удалить категорию, в которой уже есть операции");
    }

    await prisma.category.delete({
      where: { id: categoryId },
    });
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

  async setBalanceTarget(userId: string, targetAmount: number) {
    const [transactions, adjustments] = await Promise.all([
      prisma.transaction.findMany({
        where: { userId },
        select: { amount: true, type: true },
      }),
      prisma.balanceAdjustment.findMany({
        where: { userId },
        select: { amount: true },
      }),
    ]);

    const transactionBalance = transactions.reduce(
      (acc: number, transaction: { amount: Prisma.Decimal; type: "INCOME" | "EXPENSE" }) => {
        const amount = Number(transaction.amount);
        return transaction.type === "INCOME" ? acc + amount : acc - amount;
      },
      0
    );

    const adjustmentBalance = adjustments.reduce(
      (acc: number, adjustment: { amount: Prisma.Decimal }) => acc + Number(adjustment.amount),
      0
    );

    const currentBalance = transactionBalance + adjustmentBalance;
    const delta = targetAmount - currentBalance;

    if (delta === 0) {
      return { balance: currentBalance };
    }

    await prisma.balanceAdjustment.create({
      data: {
        userId,
        amount: new Prisma.Decimal(delta),
      },
    });

    return { balance: targetAmount };
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
