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

export const categorySchema = z.object({
  name: z.string().trim().min(1),
  color: z.string().trim().regex(/^#([0-9a-fA-F]{6})$/),
  type: z.enum(["EXPENSE", "INCOME"])
});

export const categoryUpdateSchema = categorySchema;
