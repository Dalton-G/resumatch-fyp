-- AlterEnum
ALTER TYPE "ApplicationStatus" ADD VALUE 'SHORTLISTED';

-- AlterTable
ALTER TABLE "JobSeekerProfile" ADD COLUMN     "isLocal" BOOLEAN NOT NULL DEFAULT true;
