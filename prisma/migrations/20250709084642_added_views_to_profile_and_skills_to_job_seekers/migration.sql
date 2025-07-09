-- AlterTable
ALTER TABLE "AdminProfile" ADD COLUMN     "views" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "CompanyProfile" ADD COLUMN     "views" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "JobPosting" ADD COLUMN     "views" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "JobSeekerProfile" ADD COLUMN     "skills" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "views" INTEGER NOT NULL DEFAULT 0;
