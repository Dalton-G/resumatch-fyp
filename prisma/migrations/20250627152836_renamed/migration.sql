/*
  Warnings:

  - You are about to drop the column `companyLocation` on the `RecruiterProfile` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "RecruiterProfile_companyLocation_idx";

-- AlterTable
ALTER TABLE "RecruiterProfile" DROP COLUMN "companyLocation",
ADD COLUMN     "companyAddress" TEXT;

-- CreateIndex
CREATE INDEX "RecruiterProfile_companyAddress_idx" ON "RecruiterProfile"("companyAddress");
