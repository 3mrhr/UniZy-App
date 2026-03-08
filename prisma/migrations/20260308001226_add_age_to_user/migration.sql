-- DropIndex
DROP INDEX "HubLike_postId_userId_key";

-- AlterTable
ALTER TABLE "TransportTrip" ADD COLUMN     "failedOtpAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "tripOTP" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "age" INTEGER;

-- CreateTable
CREATE TABLE "ShuttleBus" (
    "id" TEXT NOT NULL,
    "busNumber" TEXT NOT NULL,
    "plateNumber" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShuttleBus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShuttleStation" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShuttleStation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MealPlan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "credits" INTEGER NOT NULL,
    "frequency" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MealPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MealSubscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "remainingCredits" INTEGER NOT NULL,
    "nextBillingDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MealSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ShuttleBus_busNumber_key" ON "ShuttleBus"("busNumber");

-- CreateIndex
CREATE UNIQUE INDEX "ShuttleBus_plateNumber_key" ON "ShuttleBus"("plateNumber");

-- AddForeignKey
ALTER TABLE "MealSubscription" ADD CONSTRAINT "MealSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealSubscription" ADD CONSTRAINT "MealSubscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "MealPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
