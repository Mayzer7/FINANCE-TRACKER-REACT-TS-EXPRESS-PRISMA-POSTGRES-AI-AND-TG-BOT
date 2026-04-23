import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";
import { HttpError } from "../../lib/http-error.js";
import { prisma } from "../../lib/prisma.js";
import type { JwtPayload } from "./auth.types.js";

function signToken(payload: JwtPayload) {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: "7d" });
}

export const authService = {
  async register(email: string, password: string) {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new HttpError(409, "Пользователь с таким email уже существует");
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        categories: {
          createMany: {
            data: [
              { name: "Жилье", color: "#58ABD2", type: "EXPENSE" },
              { name: "Еда", color: "#7DB89A", type: "EXPENSE" },
              { name: "Одежда", color: "#CAA196", type: "EXPENSE" },
              { name: "Образование", color: "#8770C8", type: "EXPENSE" },
              { name: "Транспорт", color: "#D0AA63", type: "EXPENSE" },
              { name: "Зарплата", color: "#78C9A1", type: "INCOME" },
              { name: "Фриланс", color: "#67AEEA", type: "INCOME" },
              { name: "Подарок", color: "#BBA7EA", type: "INCOME" }
            ]
          }
        }
      }
    });

    const payload: JwtPayload = { sub: user.id, email: user.email };
    return { token: signToken(payload), user: payload };
  },

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new HttpError(401, "Неверный email или пароль");
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new HttpError(401, "Неверный email или пароль");
    }

    const payload: JwtPayload = { sub: user.id, email: user.email };
    return { token: signToken(payload), user: payload };
  }
};
