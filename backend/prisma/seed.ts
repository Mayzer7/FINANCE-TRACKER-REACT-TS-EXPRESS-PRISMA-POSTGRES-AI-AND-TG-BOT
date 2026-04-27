import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Prisma, PrismaClient, type TransactionType } from "@prisma/client";
import bcrypt from "bcryptjs";
import pg from "pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined");
}

const pool = new pg.Pool({
  connectionString,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const categories = [
  { name: "Жилье", color: "#58ABD2", type: "EXPENSE" as const },
  { name: "Продукты", color: "#7DB89A", type: "EXPENSE" as const },
  { name: "Кафе и кофе", color: "#F39C6B", type: "EXPENSE" as const },
  { name: "Одежда", color: "#CAA196", type: "EXPENSE" as const },
  { name: "Транспорт", color: "#D0AA63", type: "EXPENSE" as const },
  { name: "Здоровье", color: "#E07A86", type: "EXPENSE" as const },
  { name: "Маркетплейсы и дом", color: "#9B8AE6", type: "EXPENSE" as const },
  { name: "Связь и интернет", color: "#5FA8D3", type: "EXPENSE" as const },
  { name: "Подписки", color: "#7C92F5", type: "EXPENSE" as const },
  { name: "Образование", color: "#8770C8", type: "EXPENSE" as const },
  { name: "Зарплата", color: "#78C9A1", type: "INCOME" as const },
  { name: "Фриланс", color: "#67AEEA", type: "INCOME" as const },
  { name: "Премия", color: "#B4D66D", type: "INCOME" as const },
  { name: "Кешбэк и возвраты", color: "#BBA7EA", type: "INCOME" as const },
];

const transactions = [
  {
    title: "Аренда квартиры",
    amount: new Prisma.Decimal("58000"),
    type: "EXPENSE" as const,
    categoryName: "Жилье",
    createdAt: new Date("2026-04-02T08:15:00.000Z"),
  },
  {
    title: "Продукты в Перекрестке",
    amount: new Prisma.Decimal("12400"),
    type: "EXPENSE" as const,
    categoryName: "Продукты",
    createdAt: new Date("2026-04-24T18:40:00.000Z"),
  },
  {
    title: "Кофе и ланч у офиса",
    amount: new Prisma.Decimal("4300"),
    type: "EXPENSE" as const,
    categoryName: "Кафе и кофе",
    createdAt: new Date("2026-04-23T12:25:00.000Z"),
  },
  {
    title: "Такси после встречи",
    amount: new Prisma.Decimal("2900"),
    type: "EXPENSE" as const,
    categoryName: "Транспорт",
    createdAt: new Date("2026-04-21T19:10:00.000Z"),
  },
  {
    title: "Тройка и метро",
    amount: new Prisma.Decimal("1850"),
    type: "EXPENSE" as const,
    categoryName: "Транспорт",
    createdAt: new Date("2026-04-18T07:55:00.000Z"),
  },
  {
    title: "Аптека и бытовые мелочи",
    amount: new Prisma.Decimal("5400"),
    type: "EXPENSE" as const,
    categoryName: "Здоровье",
    createdAt: new Date("2026-04-17T17:20:00.000Z"),
  },
  {
    title: "Заказ для дома на маркетплейсе",
    amount: new Prisma.Decimal("7600"),
    type: "EXPENSE" as const,
    categoryName: "Маркетплейсы и дом",
    createdAt: new Date("2026-04-14T20:05:00.000Z"),
  },
  {
    title: "Мобильная связь и домашний интернет",
    amount: new Prisma.Decimal("2490"),
    type: "EXPENSE" as const,
    categoryName: "Связь и интернет",
    createdAt: new Date("2026-04-13T08:30:00.000Z"),
  },
  {
    title: "Подписки на музыку и кино",
    amount: new Prisma.Decimal("1290"),
    type: "EXPENSE" as const,
    categoryName: "Подписки",
    createdAt: new Date("2026-04-11T09:45:00.000Z"),
  },
  {
    title: "Весенняя одежда",
    amount: new Prisma.Decimal("9800"),
    type: "EXPENSE" as const,
    categoryName: "Одежда",
    createdAt: new Date("2026-04-09T16:50:00.000Z"),
  },
  {
    title: "Подписка на курс по английскому",
    amount: new Prisma.Decimal("5200"),
    type: "EXPENSE" as const,
    categoryName: "Образование",
    createdAt: new Date("2026-04-06T18:15:00.000Z"),
  },
  {
    title: "Зарплата за апрель",
    amount: new Prisma.Decimal("170000"),
    type: "INCOME" as const,
    categoryName: "Зарплата",
    createdAt: new Date("2026-04-25T07:00:00.000Z"),
  },
  {
    title: "Фриланс за лендинг для клиента",
    amount: new Prisma.Decimal("45000"),
    type: "INCOME" as const,
    categoryName: "Фриланс",
    createdAt: new Date("2026-04-19T15:30:00.000Z"),
  },
  {
    title: "Квартальная премия",
    amount: new Prisma.Decimal("18000"),
    type: "INCOME" as const,
    categoryName: "Премия",
    createdAt: new Date("2026-04-12T10:15:00.000Z"),
  },
  {
    title: "Кешбэк и возврат за покупку",
    amount: new Prisma.Decimal("3200"),
    type: "INCOME" as const,
    categoryName: "Кешбэк и возвраты",
    createdAt: new Date("2026-04-08T11:40:00.000Z"),
  },
];

const goals = [
  {
    title: "Поездка в Японию",
    description: "Две недели в Токио и Киото весной, без спешки и с хорошим запасом.",
    targetAmount: new Prisma.Decimal("450000"),
    currentAmount: new Prisma.Decimal("162000"),
  },
  {
    title: "Подушка безопасности",
    description: "Шесть месяцев базовых расходов на отдельном накопительном счете.",
    targetAmount: new Prisma.Decimal("720000"),
    currentAmount: new Prisma.Decimal("286000"),
  },
  {
    title: "Новый ноутбук для работы",
    description: "Легкий 14-дюймовый ноутбук для работы, поездок и созвонов.",
    targetAmount: new Prisma.Decimal("240000"),
    currentAmount: new Prisma.Decimal("94000"),
  },
];

function categoryKey(name: string, type: TransactionType) {
  return `${type}:${name}`;
}

async function main() {
  const email = "demo@aurafinance.local";
  const passwordHash = await bcrypt.hash("demodemo", 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash,
    },
    create: {
      email,
      passwordHash,
    },
  });

  for (const category of categories) {
    await prisma.category.upsert({
      where: {
        userId_name_type: {
          userId: user.id,
          name: category.name,
          type: category.type,
        },
      },
      update: {
        color: category.color,
      },
      create: {
        userId: user.id,
        name: category.name,
        color: category.color,
        type: category.type,
      },
    });
  }

  const userCategories = await prisma.category.findMany({
    where: { userId: user.id },
  });

  const categoriesByKey = new Map(
    userCategories.map((category) => [categoryKey(category.name, category.type), category.id])
  );

  await prisma.transaction.deleteMany({
    where: { userId: user.id },
  });

  await prisma.goalChatMessage.deleteMany({
    where: { userId: user.id },
  });

  await prisma.goal.deleteMany({
    where: { userId: user.id },
  });

  await prisma.transaction.createMany({
    data: transactions.map((transaction) => {
      const categoryId = categoriesByKey.get(categoryKey(transaction.categoryName, transaction.type));

      if (!categoryId) {
        throw new Error(`Category not found for transaction: ${transaction.categoryName}`);
      }

      return {
        title: transaction.title,
        amount: transaction.amount,
        type: transaction.type,
        createdAt: transaction.createdAt,
        userId: user.id,
        categoryId,
      };
    }),
  });

  await prisma.goal.createMany({
    data: goals.map((goal) => ({
      ...goal,
      userId: user.id,
    })),
  });

  console.log("Seed completed.");
  console.log(`Demo user: ${email}`);
  console.log("Demo password: demodemo");
  console.log(`Transactions: ${transactions.length}`);
  console.log(`Goals: ${goals.length}`);
}

void main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
