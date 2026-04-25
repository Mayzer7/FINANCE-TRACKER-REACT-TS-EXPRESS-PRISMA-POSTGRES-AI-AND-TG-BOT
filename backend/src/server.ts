import type { Telegraf } from "telegraf";
import { env } from "./config/env.js";
import { prisma } from "./lib/prisma.js";
import { createApp } from "./app.js";
import { startTelegramBot } from "./modules/telegram/telegram.bot.js";

async function bootstrap() {
  const app = createApp();
  let telegramBot: Telegraf | null = null;

  const server = app.listen(env.PORT, () => {
    console.log(`Aura Finance API listening on http://localhost:${env.PORT}`);
  });

  try {
    telegramBot = await startTelegramBot();
  } catch (error) {
    console.error("Failed to start Telegram bot", error);
  }

  async function shutdown(signal: string) {
    console.log(`Received ${signal}, shutting down gracefully...`);
    telegramBot?.stop(signal);
    await prisma.$disconnect();
    server.close(() => {
      process.exit(0);
    });
  }

  process.on("SIGINT", () => {
    void shutdown("SIGINT");
  });

  process.on("SIGTERM", () => {
    void shutdown("SIGTERM");
  });
}

void bootstrap();
