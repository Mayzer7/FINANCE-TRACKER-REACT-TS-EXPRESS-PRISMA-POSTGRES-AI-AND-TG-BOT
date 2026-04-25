import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  CLIENT_ORIGIN: z.string().url().default("http://localhost:5173"),
  APP_URL: z.string().url().default("http://localhost:5173"),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(8),
  OPENAI_API_KEY: z
    .string()
    .optional()
    .transform((value) => (value && value.trim() ? value.trim() : undefined)),
  OPENAI_MODEL: z.string().default("gpt-5.4-mini"),
  TELEGRAM_BOT_TOKEN: z
    .string()
    .optional()
    .transform((value) => (value && value.trim() ? value.trim() : undefined)),
  TELEGRAM_BOT_USERNAME: z
    .string()
    .optional()
    .transform((value) => (value && value.trim() ? value.trim().replace(/^@/, "") : undefined)),
});

export const env = envSchema.parse(process.env);
