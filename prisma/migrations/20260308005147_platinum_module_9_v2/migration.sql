-- CreateEnum
CREATE TYPE "StudentTier" AS ENUM ('BRONZE', 'SILVER', 'GOLD', 'PLATINUM');

-- AlterTable
ALTER TABLE "HubComment" ADD COLUMN     "parentId" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isShadowBanned" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "tier" "StudentTier" NOT NULL DEFAULT 'BRONZE';

-- CreateTable
CREATE TABLE "DailyStreak" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "currentCount" INTEGER NOT NULL DEFAULT 0,
    "longestCount" INTEGER NOT NULL DEFAULT 0,
    "lastActiveAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailyStreak_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Leaderboard" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Leaderboard_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DailyStreak_userId_key" ON "DailyStreak"("userId");

-- AddForeignKey
ALTER TABLE "HubComment" ADD CONSTRAINT "HubComment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "HubComment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyStreak" ADD CONSTRAINT "DailyStreak_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
