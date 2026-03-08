/*
  Warnings:

  - A unique constraint covering the columns `[redemptionToken]` on the table `Transaction` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Deal" ADD COLUMN     "maxVouchers" INTEGER DEFAULT 0,
ADD COLUMN     "remainingVouchers" INTEGER DEFAULT 0;

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "redeemedAt" TIMESTAMP(3),
ADD COLUMN     "redemptionStatus" TEXT DEFAULT 'PENDING',
ADD COLUMN     "redemptionToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_redemptionToken_key" ON "Transaction"("redemptionToken");
