ALTER TABLE "User"
ADD COLUMN     "telegramUserId" BIGINT,
ADD COLUMN     "telegramUsername" TEXT,
ADD COLUMN     "telegramFirstName" TEXT,
ADD COLUMN     "telegramLinkedAt" TIMESTAMP(3);

CREATE TABLE "TelegramLinkToken" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "TelegramLinkToken_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_telegramUserId_key" ON "User"("telegramUserId");
CREATE UNIQUE INDEX "TelegramLinkToken_tokenHash_key" ON "TelegramLinkToken"("tokenHash");
CREATE INDEX "TelegramLinkToken_userId_createdAt_idx" ON "TelegramLinkToken"("userId", "createdAt");
CREATE INDEX "TelegramLinkToken_expiresAt_idx" ON "TelegramLinkToken"("expiresAt");

ALTER TABLE "TelegramLinkToken" ADD CONSTRAINT "TelegramLinkToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
