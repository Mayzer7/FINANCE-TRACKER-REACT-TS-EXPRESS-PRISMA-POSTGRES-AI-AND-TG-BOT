import { Router } from "express";
import { authRouter } from "../modules/auth/auth.routes.js";
import { financeRouter } from "../modules/finance/finance.routes.js";

export const apiRouter = Router();

apiRouter.get("/health", (_request, response) => {
  response.status(200).json({ status: "ok" });
});

apiRouter.use("/auth", authRouter);
apiRouter.use("/finance", financeRouter);
