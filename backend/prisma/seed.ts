import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
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

async function main() {
  const email = "demo@aurafinance.local";
  const passwordHash = await bcrypt.hash("demodemo", 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      passwordHash,
    },
  });

  const categories = [
    { name: "Жилье", color: "#58ABD2", type: "EXPENSE" as const },
    { name: "Еда", color: "#7DB89A", type: "EXPENSE" as const },
    { name: "Одежда", color: "#CAA196", type: "EXPENSE" as const },
    { name: "Образование", color: "#8770C8", type: "EXPENSE" as const },
    { name: "Транспорт", color: "#D0AA63", type: "EXPENSE" as const },
    { name: "Зарплата", color: "#78C9A1", type: "INCOME" as const },
    { name: "Фриланс", color: "#67AEEA", type: "INCOME" as const },
    { name: "Подарок", color: "#BBA7EA", type: "INCOME" as const },
  ];

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

  console.log("Seed completed.");
  console.log(`Demo user: ${email}`);
  console.log("Demo password: demodemo");
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
