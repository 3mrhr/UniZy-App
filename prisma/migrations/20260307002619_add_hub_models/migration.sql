/*
  Warnings:

  - You are about to drop the column `comments` on the `HubPost` table. All the data in the column will be lost.
  - You are about to drop the column `likes` on the `HubPost` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "AuditLog" DROP CONSTRAINT "AuditLog_adminId_fkey";

-- AlterTable
ALTER TABLE "AuditLog" ALTER COLUMN "adminId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "HubPost" DROP COLUMN "comments",
DROP COLUMN "likes",
ADD COLUMN     "commentsCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "likesCount" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "CampusNotice" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'GENERAL',
    "university" TEXT NOT NULL DEFAULT 'Assiut University',
    "expiresAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CampusNotice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoommateRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "budget" DOUBLE PRECISION NOT NULL,
    "area" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "moveInDate" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "smoking" TEXT NOT NULL,
    "sleep" TEXT NOT NULL,
    "cleanliness" TEXT NOT NULL,
    "study" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoommateRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HubComment" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HubComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HubLike" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HubLike_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HubLike_postId_userId_key" ON "HubLike"("postId", "userId");

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoommateRequest" ADD CONSTRAINT "RoommateRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HubComment" ADD CONSTRAINT "HubComment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "HubPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HubComment" ADD CONSTRAINT "HubComment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HubLike" ADD CONSTRAINT "HubLike_postId_fkey" FOREIGN KEY ("postId") REFERENCES "HubPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HubLike" ADD CONSTRAINT "HubLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
