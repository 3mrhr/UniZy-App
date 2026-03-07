-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'COURIER';

-- CreateTable
CREATE TABLE "CustomDeliveryRequest" (
    "id" TEXT NOT NULL,
    "itemDescription" TEXT NOT NULL,
    "pickupLocation" TEXT,
    "dropoffLocation" TEXT NOT NULL,
    "estimatedCost" DOUBLE PRECISION,
    "actualCost" DOUBLE PRECISION,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "userId" TEXT NOT NULL,
    "courierId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomDeliveryRequest_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CustomDeliveryRequest" ADD CONSTRAINT "CustomDeliveryRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomDeliveryRequest" ADD CONSTRAINT "CustomDeliveryRequest_courierId_fkey" FOREIGN KEY ("courierId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
