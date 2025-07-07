/*
  Warnings:

  - The values [REVIEWED,INTERVIEWING,OFFERED,WITHDRAWN] on the enum `ApplicationStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [RECRUITER] on the enum `UserRole` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `applicantId` on the `JobApplication` table. All the data in the column will be lost.
  - You are about to drop the column `benefits` on the `JobPosting` table. All the data in the column will be lost.
  - You are about to drop the column `employmentType` on the `JobPosting` table. All the data in the column will be lost.
  - You are about to drop the column `experienceLevel` on the `JobPosting` table. All the data in the column will be lost.
  - You are about to drop the column `hybridWork` on the `JobPosting` table. All the data in the column will be lost.
  - You are about to drop the column `moderatedAt` on the `JobPosting` table. All the data in the column will be lost.
  - You are about to drop the column `moderatedBy` on the `JobPosting` table. All the data in the column will be lost.
  - You are about to drop the column `recruiterId` on the `JobPosting` table. All the data in the column will be lost.
  - You are about to drop the column `remoteWork` on the `JobPosting` table. All the data in the column will be lost.
  - You are about to drop the column `requirements` on the `JobPosting` table. All the data in the column will be lost.
  - You are about to drop the column `responsibilities` on the `JobPosting` table. All the data in the column will be lost.
  - You are about to drop the column `weaviateId` on the `JobPosting` table. All the data in the column will be lost.
  - You are about to drop the column `extractedText` on the `Resume` table. All the data in the column will be lost.
  - You are about to drop the column `s3Key` on the `Resume` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Resume` table. All the data in the column will be lost.
  - You are about to drop the column `weaviateId` on the `Resume` table. All the data in the column will be lost.
  - You are about to drop the `ChatHistory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EmbeddingMetadata` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `JobPreference` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RecruiterProfile` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[jobId,jobSeekerId]` on the table `JobApplication` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `jobSeekerId` to the `JobApplication` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyId` to the `JobPosting` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workType` to the `JobPosting` table without a default value. This is not possible if the table is not empty.
  - Made the column `location` on table `JobPosting` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `jobSeekerId` to the `Resume` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "WorkType" AS ENUM ('ONSITE', 'REMOTE', 'HYBRID');

-- AlterEnum
BEGIN;
CREATE TYPE "ApplicationStatus_new" AS ENUM ('APPLIED', 'REVIEWING', 'REJECTED', 'SUCCESS');
ALTER TABLE "JobApplication" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "JobApplication" ALTER COLUMN "status" TYPE "ApplicationStatus_new" USING ("status"::text::"ApplicationStatus_new");
ALTER TYPE "ApplicationStatus" RENAME TO "ApplicationStatus_old";
ALTER TYPE "ApplicationStatus_new" RENAME TO "ApplicationStatus";
DROP TYPE "ApplicationStatus_old";
ALTER TABLE "JobApplication" ALTER COLUMN "status" SET DEFAULT 'APPLIED';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "UserRole_new" AS ENUM ('JOB_SEEKER', 'COMPANY', 'ADMIN');
ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "UserRole_new" USING ("role"::text::"UserRole_new");
ALTER TYPE "UserRole" RENAME TO "UserRole_old";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";
DROP TYPE "UserRole_old";
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'JOB_SEEKER';
COMMIT;

-- DropForeignKey
ALTER TABLE "ChatHistory" DROP CONSTRAINT "ChatHistory_jobSeekerId_fkey";

-- DropForeignKey
ALTER TABLE "ChatHistory" DROP CONSTRAINT "ChatHistory_recruiterId_fkey";

-- DropForeignKey
ALTER TABLE "JobApplication" DROP CONSTRAINT "JobApplication_applicantId_fkey";

-- DropForeignKey
ALTER TABLE "JobPosting" DROP CONSTRAINT "JobPosting_moderatedBy_fkey";

-- DropForeignKey
ALTER TABLE "JobPosting" DROP CONSTRAINT "JobPosting_recruiterId_fkey";

-- DropForeignKey
ALTER TABLE "JobPreference" DROP CONSTRAINT "JobPreference_userId_fkey";

-- DropForeignKey
ALTER TABLE "RecruiterProfile" DROP CONSTRAINT "RecruiterProfile_userId_fkey";

-- DropForeignKey
ALTER TABLE "Resume" DROP CONSTRAINT "Resume_userId_fkey";

-- DropIndex
DROP INDEX "JobApplication_applicantId_idx";

-- DropIndex
DROP INDEX "JobApplication_jobId_applicantId_key";

-- DropIndex
DROP INDEX "JobPosting_recruiterId_idx";

-- DropIndex
DROP INDEX "JobPosting_weaviateId_idx";

-- DropIndex
DROP INDEX "JobPosting_weaviateId_key";

-- DropIndex
DROP INDEX "Resume_extractedText_idx";

-- DropIndex
DROP INDEX "Resume_s3Key_key";

-- DropIndex
DROP INDEX "Resume_userId_idx";

-- DropIndex
DROP INDEX "Resume_weaviateId_idx";

-- DropIndex
DROP INDEX "Resume_weaviateId_key";

-- AlterTable
ALTER TABLE "AdminProfile" ADD COLUMN     "profilePicture" TEXT;

-- AlterTable
ALTER TABLE "JobApplication" DROP COLUMN "applicantId",
ADD COLUMN     "jobSeekerId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "JobPosting" DROP COLUMN "benefits",
DROP COLUMN "employmentType",
DROP COLUMN "experienceLevel",
DROP COLUMN "hybridWork",
DROP COLUMN "moderatedAt",
DROP COLUMN "moderatedBy",
DROP COLUMN "recruiterId",
DROP COLUMN "remoteWork",
DROP COLUMN "requirements",
DROP COLUMN "responsibilities",
DROP COLUMN "weaviateId",
ADD COLUMN     "companyId" TEXT NOT NULL,
ADD COLUMN     "workType" "WorkType" NOT NULL,
ALTER COLUMN "location" SET NOT NULL;

-- AlterTable
ALTER TABLE "JobSeekerProfile" ADD COLUMN     "profilePicture" TEXT;

-- AlterTable
ALTER TABLE "Resume" DROP COLUMN "extractedText",
DROP COLUMN "s3Key",
DROP COLUMN "userId",
DROP COLUMN "weaviateId",
ADD COLUMN     "jobSeekerId" TEXT NOT NULL;

-- DropTable
DROP TABLE "ChatHistory";

-- DropTable
DROP TABLE "EmbeddingMetadata";

-- DropTable
DROP TABLE "JobPreference";

-- DropTable
DROP TABLE "RecruiterProfile";

-- CreateTable
CREATE TABLE "CompanyProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "website" TEXT,
    "industry" TEXT,
    "size" TEXT,
    "address" TEXT,
    "logoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CompanyProfile_userId_key" ON "CompanyProfile"("userId");

-- CreateIndex
CREATE INDEX "CompanyProfile_name_idx" ON "CompanyProfile"("name");

-- CreateIndex
CREATE INDEX "CompanyProfile_address_idx" ON "CompanyProfile"("address");

-- CreateIndex
CREATE INDEX "CompanyProfile_userId_idx" ON "CompanyProfile"("userId");

-- CreateIndex
CREATE INDEX "JobApplication_jobSeekerId_idx" ON "JobApplication"("jobSeekerId");

-- CreateIndex
CREATE UNIQUE INDEX "JobApplication_jobId_jobSeekerId_key" ON "JobApplication"("jobId", "jobSeekerId");

-- CreateIndex
CREATE INDEX "JobPosting_companyId_idx" ON "JobPosting"("companyId");

-- CreateIndex
CREATE INDEX "Resume_jobSeekerId_idx" ON "Resume"("jobSeekerId");

-- AddForeignKey
ALTER TABLE "CompanyProfile" ADD CONSTRAINT "CompanyProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resume" ADD CONSTRAINT "Resume_jobSeekerId_fkey" FOREIGN KEY ("jobSeekerId") REFERENCES "JobSeekerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobPosting" ADD CONSTRAINT "JobPosting_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "CompanyProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobApplication" ADD CONSTRAINT "JobApplication_jobSeekerId_fkey" FOREIGN KEY ("jobSeekerId") REFERENCES "JobSeekerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
