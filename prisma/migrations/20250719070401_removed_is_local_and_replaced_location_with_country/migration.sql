/*
  Warnings:

  - You are about to drop the column `isLocal` on the `JobSeekerProfile` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `JobSeekerProfile` table. All the data in the column will be lost.
  - You are about to drop the column `isLocal` on the `ResumeEmbedding` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "JobSeekerProfile_location_idx";

-- AlterTable
ALTER TABLE "JobPostingEmbedding" ALTER COLUMN "country" SET DEFAULT 'Malaysia';

-- AlterTable
ALTER TABLE "JobSeekerProfile" DROP COLUMN "isLocal",
DROP COLUMN "location",
ADD COLUMN     "country" TEXT;

-- AlterTable
ALTER TABLE "ResumeEmbedding" DROP COLUMN "isLocal",
ADD COLUMN     "country" TEXT DEFAULT 'Malaysia';

-- CreateIndex
CREATE INDEX "JobSeekerProfile_country_idx" ON "JobSeekerProfile"("country");
