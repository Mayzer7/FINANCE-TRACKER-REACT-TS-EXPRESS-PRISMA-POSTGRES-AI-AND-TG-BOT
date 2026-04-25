import { Context, Markup, Telegraf } from "telegraf";
import { env } from "../../config/env.js";
import { telegramService } from "./telegram.service.js";

type WizardState =
  | { step: "idle" }
  | { step: "awaitingExpenseTitle" }
  | { step: "awaitingIncomeTitle" }
  | { step: "awaitingExpenseAmount"; title: string }
  | { step: "awaitingIncomeAmount"; title: string }
  | { step: "awaitingExpenseCategory"; title: string; amount: number }
  | { step: "awaitingIncomeCategory"; title: string; amount: number };

const botState = new Map<string, WizardState>();

function getMainKeyboard() {
  return Markup.keyboard([["Добавить расход", "Добавить доход"], ["Статистика", "Открыть сайт"]]).resize();
}

function getCancelKeyboard() {
  return Markup.keyboard([["Отмена"]]).resize();
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function formatAmount(amount: number, { signed = false }: { signed?: boolean } = {}) {
  const formatted = new Intl.NumberFormat("ru-RU", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Math.abs(amount));

  if (signed) {
    const sign = amount >= 0 ? "+" : "-";
    return `${sign}${formatted} ₽`;
  }

  return `${formatted} ₽`;
}

function buildGreeting() {
  return [
    "Привет! Я бот Aura Finance.",
    "Я помогаю быстро добавлять доходы и расходы, а всю аналитику и историю операций удобнее смотреть уже на сайте.",
  ].join("\n");
}

function buildStatisticsMessage(summary: { balance: number; income: number; expenses: number }) {
  return [
    "Ваша статистика за всё время:",
    `Баланс: ${formatAmount(summary.balance)}`,
    `Доходы: ${formatAmount(summary.income, { signed: true })}`,
    `Расходы: ${formatAmount(-summary.expenses, { signed: true })}`,
  ].join("\n");
}

function isPrivateHostname(hostname: string) {
  const normalized = hostname.toLowerCase();

  if (
    normalized === "localhost" ||
    normalized === "127.0.0.1" ||
    normalized === "0.0.0.0" ||
    normalized === "::1"
  ) {
    return true;
  }

  if (
    normalized.startsWith("10.") ||
    normalized.startsWith("192.168.") ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(normalized)
  ) {
    return true;
  }

  return false;
}

function getTelegramSafeAppUrl(pathname: string) {
  try {
    const url = new URL(pathname, env.APP_URL);

    if (url.protocol !== "https:" || isPrivateHostname(url.hostname)) {
      return null;
    }

    return url.toString();
  } catch {
    return null;
  }
}

function getManualAppUrl(pathname: string) {
  return new URL(pathname, env.APP_URL).toString();
}

function isTunnelHintNeeded() {
  return !getTelegramSafeAppUrl("/app/expenses");
}

function buildPlainSiteHintText(text: string, manualUrl: string) {
  const lines = [
    text,
    "",
    `Сайт сейчас доступен по адресу: ${manualUrl}`,
    "Telegram не может открыть локальный адрес кнопкой, поэтому откройте его вручную в браузере.",
  ];

  if (isTunnelHintNeeded()) {
    lines.push(
      "Чтобы получить кликабельный переход из Telegram, укажите в APP_URL публичный HTTPS tunnel URL."
    );
  }

  return lines.join("\n");
}

function buildHtmlSiteHintText(text: string, safeUrl: string) {
  return [escapeHtml(text), "", `<a href="${escapeHtml(safeUrl)}">Открыть сайт</a>`].join("\n");
}

async function sendSiteHint(
  context: Context,
  params: {
    text: string;
    path: string;
    buttonText: string;
  }
) {
  const safeUrl = getTelegramSafeAppUrl(params.path);
  const manualUrl = getManualAppUrl(params.path);

  if (safeUrl) {
    try {
      await context.reply(
        params.text,
        Markup.inlineKeyboard([Markup.button.url(params.buttonText, safeUrl)])
      );
      return;
    } catch (error) {
      console.error("Failed to send Telegram URL button, falling back to HTML text link", error);
    }

    try {
      await context.reply(buildHtmlSiteHintText(params.text, safeUrl), {
        parse_mode: "HTML",
      });
      return;
    } catch (error) {
      console.error("Failed to send Telegram HTML link, falling back to plain text", error);
    }
  }

  await context.reply(buildPlainSiteHintText(params.text, manualUrl));
}

function buildOpenSiteMessage() {
  return "Откройте сайт Aura Finance, чтобы увидеть всю статистику и управлять финансами подробнее.";
}

function parseAmount(rawValue: string) {
  const normalized = rawValue.replace(",", ".").trim();
  const amount = Number(normalized);

  if (!Number.isFinite(amount) || amount <= 0) {
    return null;
  }

  return amount;
}

function parseTitle(rawValue: string) {
  const title = rawValue.trim();
  return title.length ? title : null;
}

function setIdleState(telegramUserId: string) {
  botState.set(telegramUserId, { step: "idle" });
}

async function sendMainMenu(context: Context) {
  await context.reply(buildGreeting(), getMainKeyboard());
}

async function ensureLinked(context: Context, telegramUserId: string) {
  const linkedUser = await telegramService.getLinkedUserByTelegramId(telegramUserId);

  if (!linkedUser) {
    await sendSiteHint(context, {
      text: "Сначала привяжите Telegram в профиле на сайте Aura Finance, а затем возвращайтесь сюда.",
      path: "/app/profile",
      buttonText: "Открыть сайт",
    });
    return null;
  }

  return linkedUser;
}

async function requestCategories(
  context: Context,
  telegramUserId: string,
  type: "expense" | "income",
  title: string,
  amount: number
) {
  const { categories } = await telegramService.getCategoriesForLinkedUser(telegramUserId, type);

  if (!categories.length) {
    setIdleState(telegramUserId);
    await sendSiteHint(context, {
      text: "Для этого типа операций у вас пока нет категорий. Создайте их на сайте и затем вернитесь в бот.",
      path: "/app/categories",
      buttonText: "Открыть категории",
    });
    await context.reply("Главное меню снова доступно.", getMainKeyboard());
    return;
  }

  botState.set(telegramUserId, {
    step: type === "expense" ? "awaitingExpenseCategory" : "awaitingIncomeCategory",
    title,
    amount,
  });

  const rows = categories.map((category) => [category.name]);
  rows.push(["Отмена"]);

  await context.reply(
    type === "expense" ? "Выберите категорию расхода." : "Выберите категорию дохода.",
    Markup.keyboard(rows).resize()
  );
}

export async function startTelegramBot() {
  if (!env.TELEGRAM_BOT_TOKEN) {
    console.log("Telegram bot is disabled: TELEGRAM_BOT_TOKEN is not set");
    return null;
  }

  const bot = new Telegraf(env.TELEGRAM_BOT_TOKEN);

  bot.start(async (context) => {
    const telegramUserId = String(context.from?.id ?? "");

    if (!telegramUserId) {
      return;
    }

    const payload = context.payload;

    try {
      if (payload?.startsWith("link_")) {
        const rawToken = payload.replace(/^link_/, "");
        const result = await telegramService.connectTelegramAccount({
          rawToken,
          telegramUserId,
          telegramUsername: context.from?.username,
          telegramFirstName: context.from?.first_name,
        });

        setIdleState(telegramUserId);

        await context.reply(
          `Готово! Telegram подключён к вашему профилю Aura Finance (${result.label}).`,
          getMainKeyboard()
        );
        await context.reply("Теперь можно быстро вносить доходы и расходы прямо из бота.");
        return;
      }

      setIdleState(telegramUserId);
      await sendMainMenu(context);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Не удалось обработать команду /start";
      await context.reply(message, getMainKeyboard());
    }
  });

  bot.hears("Отмена", async (context) => {
    const telegramUserId = String(context.from?.id ?? "");

    if (!telegramUserId) {
      return;
    }

    setIdleState(telegramUserId);
    await context.reply("Текущее действие отменено.", getMainKeyboard());
  });

  bot.hears("Открыть сайт", async (context) => {
    const telegramUserId = String(context.from?.id ?? "");

    if (telegramUserId) {
      setIdleState(telegramUserId);
    }

    await sendSiteHint(context, {
      text: buildOpenSiteMessage(),
      path: "/app/expenses",
      buttonText: "Открыть сайт",
    });
  });

  bot.hears("Статистика", async (context) => {
    const telegramUserId = String(context.from?.id ?? "");

    if (!telegramUserId) {
      return;
    }

    const linkedUser = await ensureLinked(context, telegramUserId);

    if (!linkedUser) {
      return;
    }

    setIdleState(telegramUserId);

    try {
      const summary = await telegramService.getSummaryForLinkedUser(telegramUserId);
      await context.reply(buildStatisticsMessage(summary), getMainKeyboard());
    } catch (error) {
      const message = error instanceof Error ? error.message : "Не удалось загрузить статистику";
      await context.reply(message, getMainKeyboard());
    }
  });

  bot.hears("Добавить расход", async (context) => {
    const telegramUserId = String(context.from?.id ?? "");

    if (!telegramUserId) {
      return;
    }

    const linkedUser = await ensureLinked(context, telegramUserId);

    if (!linkedUser) {
      return;
    }

    botState.set(telegramUserId, { step: "awaitingExpenseTitle" });
    await context.reply("Введите название расхода, например: продукты, кофе, аренда.", getCancelKeyboard());
  });

  bot.hears("Добавить доход", async (context) => {
    const telegramUserId = String(context.from?.id ?? "");

    if (!telegramUserId) {
      return;
    }

    const linkedUser = await ensureLinked(context, telegramUserId);

    if (!linkedUser) {
      return;
    }

    botState.set(telegramUserId, { step: "awaitingIncomeTitle" });
    await context.reply("Введите название дохода, например: зарплата, фриланс, подарок.", getCancelKeyboard());
  });

  bot.on("text", async (context, next) => {
    const telegramUserId = String(context.from?.id ?? "");

    if (!telegramUserId) {
      return next();
    }

    const state = botState.get(telegramUserId) ?? { step: "idle" as const };
    const text = context.message.text.trim();

    if (state.step === "idle") {
      return next();
    }

    try {
      if (state.step === "awaitingExpenseTitle" || state.step === "awaitingIncomeTitle") {
        const title = parseTitle(text);

        if (!title) {
          await context.reply("Введите непустое понятное название операции.");
          return;
        }

        botState.set(telegramUserId, {
          step: state.step === "awaitingExpenseTitle" ? "awaitingExpenseAmount" : "awaitingIncomeAmount",
          title,
        });

        await context.reply(
          state.step === "awaitingExpenseTitle" ? "Теперь введите сумму расхода." : "Теперь введите сумму дохода."
        );
        return;
      }

      if (state.step === "awaitingExpenseAmount" || state.step === "awaitingIncomeAmount") {
        const amount = parseAmount(text);

        if (!amount) {
          await context.reply("Введите корректную сумму больше нуля.");
          return;
        }

        await requestCategories(
          context,
          telegramUserId,
          state.step === "awaitingExpenseAmount" ? "expense" : "income",
          state.title,
          amount
        );
        return;
      }

      if (state.step === "awaitingExpenseCategory" || state.step === "awaitingIncomeCategory") {
        const type = state.step === "awaitingExpenseCategory" ? "expense" : "income";
        const { categories } = await telegramService.getCategoriesForLinkedUser(telegramUserId, type);
        const category = categories.find((item) => item.name === text);

        if (!category) {
          await context.reply("Выберите категорию из кнопок ниже или нажмите «Отмена».");
          return;
        }

        const result = await telegramService.createTransactionForTelegram({
          telegramUserId,
          title: state.title,
          type,
          amount: state.amount,
          categoryId: category.id,
        });

        setIdleState(telegramUserId);

        await context.reply(
          `${type === "expense" ? "Расход" : "Доход"} сохранён.\nНазвание: ${state.title}\nСумма: ${formatAmount(
            state.amount
          )}\nКатегория: ${result.category.name}`,
          getMainKeyboard()
        );
        return;
      }
    } catch (error) {
      setIdleState(telegramUserId);
      const message = error instanceof Error ? error.message : "Не удалось сохранить операцию";
      await context.reply(message, getMainKeyboard());
      return;
    }

    return next();
  });

  await bot.launch();
  console.log("Telegram bot is running in long polling mode");
  return bot;
}
