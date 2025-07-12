/*
  Warnings:

  - You are about to drop the column `logoUrl` on the `CompanyProfile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CompanyProfile" DROP COLUMN "logoUrl",
ADD COLUMN     "profilePicture" TEXT;
