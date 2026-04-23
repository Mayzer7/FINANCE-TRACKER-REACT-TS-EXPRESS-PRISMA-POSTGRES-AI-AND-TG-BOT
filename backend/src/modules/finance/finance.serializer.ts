import type { Category, Goal, Prisma, Transaction, TransactionType } from "@prisma/client";

function serializeTransactionType(type: TransactionType): "expense" | "income" {
  return type === "INCOME" ? "income" : "expense";
}

export function serializeCategory(category: Category) {
  return {
    id: category.id,
    name: category.name,
    color: category.color,
    type: serializeTransactionType(category.type),
  };
}

export function serializeTransaction(
  transaction: Transaction & { amount: Prisma.Decimal }
) {
  return {
    id: transaction.id,
    title: transaction.title,
    amount: Number(transaction.amount),
    categoryId: transaction.categoryId,
    createdAt: transaction.createdAt.toISOString(),
    type: serializeTransactionType(transaction.type),
  };
}

export function serializeGoal(goal: Goal & { targetAmount: Prisma.Decimal; currentAmount: Prisma.Decimal }) {
  return {
    id: goal.id,
    title: goal.title,
    description: goal.description,
    targetAmount: Number(goal.targetAmount),
    currentAmount: Number(goal.currentAmount),
  };
}
