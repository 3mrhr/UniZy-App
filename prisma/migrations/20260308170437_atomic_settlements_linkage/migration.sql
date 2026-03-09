/*
  Warnings:

  - A unique constraint covering the columns `[postId,userId]` on the table `HubLike` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "settlementId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "HubLike_postId_userId_key" ON "HubLike"("postId", "userId");

-- CreateIndex
CREATE INDEX "Transaction_settlementId_idx" ON "Transaction"("settlementId");

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_settlementId_fkey" FOREIGN KEY ("settlementId") REFERENCES "Settlement"("id") ON DELETE SET NULL ON UPDATE CASCADE;
