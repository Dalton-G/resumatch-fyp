/*
  Warnings:

  - You are about to drop the column `location` on the `JobPosting` table. All the data in the column will be lost.
  - Added the required column `country` to the `JobPosting` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "JobPosting_location_idx";

-- AlterTable
ALTER TABLE "JobPosting" DROP COLUMN "location",
ADD COLUMN     "country" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "JobPosting_country_idx" ON "JobPosting"("country");
