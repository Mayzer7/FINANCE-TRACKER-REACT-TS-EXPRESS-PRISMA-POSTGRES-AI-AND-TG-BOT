import { z } from "zod";

export const transactionSchema = z.object({
  title: z.string().min(1),
  amount: z.coerce.number().positive(),
  type: z.enum(["EXPENSE", "INCOME"]),
  categoryId: z.string().min(1)
});

export const goalSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  targetAmount: z.coerce.number().positive(),
  currentAmount: z.coerce.number().min(0)
});

export const goalContributionSchema = z.object({
  amount: z.coerce.number().positive()
});

export const balanceAdjustmentSchema = z.object({
  targetAmount: z.coerce.number()
});
