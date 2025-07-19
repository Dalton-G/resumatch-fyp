-- AlterTable
ALTER TABLE "JobPostingEmbedding" ADD COLUMN     "country" TEXT NOT NULL DEFAULT 'MY',
ADD COLUMN     "salaryMax" INTEGER,
ADD COLUMN     "salaryMin" INTEGER,
ADD COLUMN     "workType" "WorkType" NOT NULL DEFAULT 'ONSITE';

-- AlterTable
ALTER TABLE "ResumeEmbedding" ADD COLUMN     "isLocal" BOOLEAN NOT NULL DEFAULT true;
