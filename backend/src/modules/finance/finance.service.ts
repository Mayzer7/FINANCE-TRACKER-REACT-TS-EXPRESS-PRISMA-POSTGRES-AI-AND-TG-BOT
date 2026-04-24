import { Prisma, type BalanceAdjustment, type GoalChatMessage, type Transaction } from "@prisma/client";
import { HttpError } from "../../lib/http-error.js";
import { prisma } from "../../lib/prisma.js";
import { generateGoalAssistantReply } from "./finance.ai.js";
import {
  serializeCategory,
  serializeGoal,
  serializeGoalChatMessage,
  serializeTransaction,
} from "./finance.serializer.js";

const RECENT_TRANSACTIONS_LIMIT = 30;
const CHAT_HISTORY_LIMIT = 16;

function buildSummary(
  transactions: Array<Transaction & { amount: Prisma.Decimal }>,
  adjustments: Array<BalanceAdjustment & { amount: Prisma.Decimal }>
) {
  const summaryBase = transactions.reduce(
    (acc: { income: number; expenses: number; balance: number }, transaction) => {
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

  const adjustmentTotal = adjustments.reduce((acc, adjustment) => acc + Number(adjustment.amount), 0);

  return {
    ...summaryBase,
    balance: summaryBase.balance + adjustmentTotal,
  };
}

async function getGoalOrThrow(userId: string, goalId: string) {
  const goal = await prisma.goal.findFirst({
    where: { id: goalId, userId },
  });

  if (!goal) {
    throw new HttpError(404, "Цель не найдена");
  }

  return goal;
}

async function getTransactionOrThrow(userId: string, transactionId: string) {
  const transaction = await prisma.transaction.findFirst({
    where: { id: transactionId, userId },
  });

  if (!transaction) {
    throw new HttpError(404, "Операция не найдена");
  }

  return transaction;
}

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

    return {
      summary: buildSummary(transactions, adjustments),
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

    if (existingCategory.type !== payload.type && existingCategory.transactions.length > 0) {
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

  async updateTransaction(
    userId: string,
    transactionId: string,
    payload: { title: string; amount: number; type: "EXPENSE" | "INCOME"; categoryId: string }
  ) {
    await getTransactionOrThrow(userId, transactionId);

    const category = await prisma.category.findFirst({
      where: { id: payload.categoryId, userId, type: payload.type },
    });

    if (!category) {
      throw new HttpError(404, "Категория не найдена или не подходит под тип операции");
    }

    const transaction = await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        title: payload.title,
        amount: new Prisma.Decimal(payload.amount),
        type: payload.type,
        categoryId: payload.categoryId,
      },
    });

    return serializeTransaction(transaction);
  },

  async deleteTransaction(userId: string, transactionId: string) {
    await getTransactionOrThrow(userId, transactionId);

    await prisma.transaction.delete({
      where: { id: transactionId },
    });
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

  async updateGoal(userId: string, goalId: string, currentAmount: number) {
    const existingGoal = await getGoalOrThrow(userId, goalId);

    const safeCurrentAmount = Math.min(currentAmount, Number(existingGoal.targetAmount));

    const goal = await prisma.goal.update({
      where: { id: goalId },
      data: {
        currentAmount: new Prisma.Decimal(safeCurrentAmount),
      },
    });

    return serializeGoal(goal);
  },

  async deleteGoal(userId: string, goalId: string) {
    await getGoalOrThrow(userId, goalId);

    await prisma.goal.delete({
      where: { id: goalId },
    });
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

    const transactionBalance = transactions.reduce((acc, transaction) => {
      const amount = Number(transaction.amount);
      return transaction.type === "INCOME" ? acc + amount : acc - amount;
    }, 0);

    const adjustmentBalance = adjustments.reduce((acc, adjustment) => acc + Number(adjustment.amount), 0);
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
    const existingGoal = await getGoalOrThrow(userId, goalId);

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

  async getGoalChat(userId: string, goalId: string) {
    await getGoalOrThrow(userId, goalId);

    const messages = await prisma.goalChatMessage.findMany({
      where: { userId, goalId },
      orderBy: { createdAt: "asc" },
    });

    return {
      messages: messages.map(serializeGoalChatMessage),
    };
  },

  async sendGoalChatMessage(userId: string, goalId: string, content: string) {
    const [goal, user, categories, goals, transactions, adjustments, history] = await Promise.all([
      getGoalOrThrow(userId, goalId),
      prisma.user.findUnique({
        where: { id: userId },
        select: { email: true },
      }),
      prisma.category.findMany({
        where: { userId },
        orderBy: [{ type: "asc" }, { name: "asc" }],
      }),
      prisma.goal.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      }),
      prisma.transaction.findMany({
        where: { userId },
        include: {
          category: {
            select: { name: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: RECENT_TRANSACTIONS_LIMIT,
      }),
      prisma.balanceAdjustment.findMany({
        where: { userId },
        orderBy: { createdAt: "asc" },
      }),
      prisma.goalChatMessage.findMany({
        where: { userId, goalId },
        orderBy: { createdAt: "asc" },
        take: CHAT_HISTORY_LIMIT,
      }),
    ]);

    const summary = buildSummary(transactions, adjustments);
    const assistantReply = await generateGoalAssistantReply({
      userEmail: user?.email ?? "unknown",
      currentGoal: {
        title: goal.title,
        description: goal.description,
        currentAmount: Number(goal.currentAmount),
        targetAmount: Number(goal.targetAmount),
      },
      summary,
      categories: categories.map((category) => ({
        name: category.name,
        color: category.color,
        type: category.type === "INCOME" ? "income" : "expense",
      })),
      goals: goals.map((currentGoal) => ({
        title: currentGoal.title,
        currentAmount: Number(currentGoal.currentAmount),
        targetAmount: Number(currentGoal.targetAmount),
      })),
      transactions: transactions.map((transaction) => ({
        title: transaction.title,
        amount: Number(transaction.amount),
        type: transaction.type === "INCOME" ? "income" : "expense",
        category: transaction.category.name,
        createdAt: transaction.createdAt.toISOString(),
      })),
      history: history.map((message: GoalChatMessage) => ({
        role: message.role === "ASSISTANT" ? "assistant" : "user",
        content: message.content,
      })),
      userMessage: content,
    });

    const result = await prisma.$transaction(async (tx) => {
      const userMessage = await tx.goalChatMessage.create({
        data: {
          userId,
          goalId,
          role: "USER",
          content,
        },
      });

      const assistantMessage = await tx.goalChatMessage.create({
        data: {
          userId,
          goalId,
          role: "ASSISTANT",
          content: assistantReply,
        },
      });

      return { userMessage, assistantMessage };
    });

    return {
      userMessage: serializeGoalChatMessage(result.userMessage),
      assistantMessage: serializeGoalChatMessage(result.assistantMessage),
    };
  },
};
