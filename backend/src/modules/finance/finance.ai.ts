import OpenAI from "openai";
import { env } from "../../config/env.js";
import { HttpError } from "../../lib/http-error.js";

type GoalAssistantParams = {
  userEmail: string;
  currentGoal: {
    title: string;
    description: string;
    currentAmount: number;
    targetAmount: number;
  };
  summary: {
    income: number;
    expenses: number;
    balance: number;
  };
  categories: Array<{
    name: string;
    type: "expense" | "income";
    color: string;
  }>;
  goals: Array<{
    title: string;
    currentAmount: number;
    targetAmount: number;
  }>;
  transactions: Array<{
    title: string;
    amount: number;
    type: "expense" | "income";
    category: string;
    createdAt: string;
  }>;
  history: Array<{
    role: "user" | "assistant";
    content: string;
  }>;
  userMessage: string;
};

let openaiClient: OpenAI | null = null;

function getOpenAIClient() {
  if (!env.OPENAI_API_KEY) {
    throw new HttpError(
      503,
      "AI-чат пока не настроен. Добавьте OPENAI_API_KEY в backend/.env и перезапустите сервер."
    );
  }

  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey: env.OPENAI_API_KEY });
  }

  return openaiClient;
}

const SYSTEM_PROMPT = `
Ты — AI-помощник внутри приложения Aura Finance.
Отвечай только на русском языке.
Твоя роль — спокойный и практичный финансовый советчик по личным финансам.
Опирайся только на переданные данные пользователя и явно говори, если информации недостаточно.
Не выдавай себя за бухгалтера, налогового консультанта или лицензированного инвестиционного советника.
Отвечай коротко, по делу, с конкретными рекомендациями и без выдуманных чисел.
Если вопрос связан с целью, привязывай советы к текущей цели и реальному финансовому поведению пользователя.
`;

function buildContextMessage(params: GoalAssistantParams) {
  return JSON.stringify(
    {
      userEmail: params.userEmail,
      summary: params.summary,
      currentGoal: params.currentGoal,
      categories: params.categories,
      goals: params.goals,
      recentTransactions: params.transactions,
    },
    null,
    2
  );
}

export async function generateGoalAssistantReply(params: GoalAssistantParams) {
  const client = getOpenAIClient();

  const completion = await client.chat.completions.create({
    model: env.OPENAI_MODEL,
    temperature: 0.6,
    max_completion_tokens: 500,
    messages: [
      { role: "developer", content: SYSTEM_PROMPT.trim() },
      {
        role: "developer",
        content: `Контекст пользователя и его данных:\n${buildContextMessage(params)}`,
      },
      ...params.history.map((message) => ({
        role: message.role,
        content: message.content,
      })),
      { role: "user", content: params.userMessage },
    ],
  });

  const content = completion.choices[0]?.message?.content;
  if (typeof content !== "string" || !content.trim()) {
    throw new HttpError(502, "AI не вернул текстовый ответ. Попробуйте ещё раз.");
  }

  return content.trim();
}
