import crypto from "node:crypto";
import { TransactionType } from "@prisma/client";
import { env } from "../../config/env.js";
import { HttpError } from "../../lib/http-error.js";
import { prisma } from "../../lib/prisma.js";
import { financeService } from "../finance/finance.service.js";

const LINK_TOKEN_TTL_MS = 15 * 60 * 1000;

function hashToken(rawToken: string) {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}

function createRawToken() {
  return crypto.randomBytes(24).toString("base64url");
}

function buildTelegramDisplayName(params: { username: string | null; firstName: string | null }) {
  if (params.username) {
    return `@${params.username}`;
  }

  if (params.firstName) {
    return params.firstName;
  }

  return "Telegram подключён";
}

export const telegramService = {
  async getStatus(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        telegramUserId: true,
        telegramUsername: true,
        telegramFirstName: true,
        telegramLinkedAt: true,
      },
    });

    if (!user) {
      throw new HttpError(404, "Пользователь не найден");
    }

    const connected = Boolean(user.telegramUserId);

    return {
      connected,
      username: user.telegramUsername,
      firstName: user.telegramFirstName,
      linkedAt: user.telegramLinkedAt?.toISOString() ?? null,
      label: connected
        ? buildTelegramDisplayName({
            username: user.telegramUsername,
            firstName: user.telegramFirstName,
          })
        : "Не подключён",
    };
  },

  async createLink(userId: string) {
    if (!env.TELEGRAM_BOT_USERNAME) {
      throw new HttpError(500, "В окружении не задан TELEGRAM_BOT_USERNAME");
    }

    const rawToken = createRawToken();
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + LINK_TOKEN_TTL_MS);

    await prisma.telegramLinkToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt,
      },
    });

    return {
      deepLink: `https://t.me/${env.TELEGRAM_BOT_USERNAME}?start=link_${rawToken}`,
      expiresAt: expiresAt.toISOString(),
    };
  },

  async connectTelegramAccount(params: {
    rawToken: string;
    telegramUserId: string;
    telegramUsername?: string;
    telegramFirstName?: string;
  }) {
    const tokenHash = hashToken(params.rawToken);
    const now = new Date();

    const linkToken = await prisma.telegramLinkToken.findUnique({
      where: { tokenHash },
      include: {
        user: {
          select: {
            id: true,
            telegramUserId: true,
          },
        },
      },
    });

    if (!linkToken || linkToken.usedAt || linkToken.expiresAt < now) {
      throw new HttpError(400, "Ссылка для привязки устарела или уже была использована");
    }

    const existingLinkedUser = await prisma.user.findFirst({
      where: {
        telegramUserId: BigInt(params.telegramUserId),
        id: {
          not: linkToken.userId,
        },
      },
      select: { id: true },
    });

    if (existingLinkedUser) {
      throw new HttpError(409, "Этот Telegram-аккаунт уже привязан к другому профилю");
    }

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: linkToken.userId },
        data: {
          telegramUserId: BigInt(params.telegramUserId),
          telegramUsername: params.telegramUsername ?? null,
          telegramFirstName: params.telegramFirstName ?? null,
          telegramLinkedAt: now,
        },
      });

      await tx.telegramLinkToken.update({
        where: { id: linkToken.id },
        data: {
          usedAt: now,
        },
      });
    });

    return {
      label: buildTelegramDisplayName({
        username: params.telegramUsername ?? null,
        firstName: params.telegramFirstName ?? null,
      }),
    };
  },

  async getLinkedUserByTelegramId(telegramUserId: string) {
    return prisma.user.findFirst({
      where: {
        telegramUserId: BigInt(telegramUserId),
      },
      select: {
        id: true,
        email: true,
        telegramUsername: true,
        telegramFirstName: true,
      },
    });
  },

  async getCategoriesForLinkedUser(telegramUserId: string, type: "expense" | "income") {
    const user = await this.getLinkedUserByTelegramId(telegramUserId);

    if (!user) {
      throw new HttpError(403, "Сначала привяжите Telegram в профиле на сайте");
    }

    const categories = await prisma.category.findMany({
      where: {
        userId: user.id,
        type: type === "expense" ? TransactionType.EXPENSE : TransactionType.INCOME,
      },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        color: true,
      },
    });

    return {
      user,
      categories,
    };
  },

  async getSummaryForLinkedUser(telegramUserId: string) {
    const user = await this.getLinkedUserByTelegramId(telegramUserId);

    if (!user) {
      throw new HttpError(403, "Сначала привяжите Telegram в профиле на сайте");
    }

    const dashboard = await financeService.getDashboard(user.id);

    return dashboard.summary;
  },

  async createTransactionForTelegram(params: {
    telegramUserId: string;
    title: string;
    type: "expense" | "income";
    amount: number;
    categoryId: string;
  }) {
    const user = await this.getLinkedUserByTelegramId(params.telegramUserId);

    if (!user) {
      throw new HttpError(403, "Сначала привяжите Telegram в профиле на сайте");
    }

    const category = await prisma.category.findFirst({
      where: {
        id: params.categoryId,
        userId: user.id,
        type: params.type === "expense" ? TransactionType.EXPENSE : TransactionType.INCOME,
      },
      select: {
        id: true,
        name: true,
      },
    });

    if (!category) {
      throw new HttpError(404, "Категория не найдена");
    }

    const transaction = await financeService.createTransaction(user.id, {
      title: params.title.trim(),
      amount: params.amount,
      type: params.type === "expense" ? TransactionType.EXPENSE : TransactionType.INCOME,
      categoryId: category.id,
    });

    return {
      transaction,
      category,
    };
  },
};
