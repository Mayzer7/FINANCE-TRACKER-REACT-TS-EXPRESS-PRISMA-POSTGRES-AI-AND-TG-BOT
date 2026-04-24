-- CreateEnum
CREATE TYPE "GoalChatRole" AS ENUM ('USER', 'ASSISTANT');

-- CreateTable
CREATE TABLE "GoalChatMessage" (
    "id" TEXT NOT NULL,
    "role" "GoalChatRole" NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "goalId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "GoalChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GoalChatMessage_goalId_createdAt_idx" ON "GoalChatMessage"("goalId", "createdAt");

-- CreateIndex
CREATE INDEX "GoalChatMessage_userId_goalId_createdAt_idx" ON "GoalChatMessage"("userId", "goalId", "createdAt");

-- AddForeignKey
ALTER TABLE "GoalChatMessage" ADD CONSTRAINT "GoalChatMessage_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "Goal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoalChatMessage" ADD CONSTRAINT "GoalChatMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
