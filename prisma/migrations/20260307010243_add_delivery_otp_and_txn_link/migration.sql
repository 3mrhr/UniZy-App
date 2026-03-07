/*
  Warnings:

  - A unique constraint covering the columns `[transactionId]` on the table `CustomDeliveryRequest` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "CustomDeliveryRequest" ADD COLUMN     "deliveryOTP" TEXT,
ADD COLUMN     "transactionId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "CustomDeliveryRequest_transactionId_key" ON "CustomDeliveryRequest"("transactionId");

-- AddForeignKey
ALTER TABLE "CustomDeliveryRequest" ADD CONSTRAINT "CustomDeliveryRequest_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;
