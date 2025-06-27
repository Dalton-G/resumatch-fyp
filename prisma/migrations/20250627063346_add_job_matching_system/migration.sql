-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('JOB_SEEKER', 'RECRUITER', 'ADMIN');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('URGENTLY_HIRING', 'HIRING', 'CLOSED', 'CLOSED_BY_ADMIN');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('APPLIED', 'REVIEWED', 'INTERVIEWING', 'OFFERED', 'REJECTED', 'WITHDRAWN');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isApproved" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'JOB_SEEKER';

-- CreateTable
CREATE TABLE "JobSeekerProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "phone" TEXT,
    "location" TEXT,
    "bio" TEXT,
    "linkedinUrl" TEXT,
    "githubUrl" TEXT,
    "portfolioUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobSeekerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecruiterProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "phone" TEXT,
    "title" TEXT,
    "companyName" TEXT NOT NULL,
    "companyDescription" TEXT,
    "companyWebsite" TEXT,
    "companyIndustry" TEXT,
    "companySize" TEXT,
    "companyLocation" TEXT,
    "companyLogoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecruiterProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Resume" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "s3Key" TEXT NOT NULL,
    "s3Url" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "extractedText" TEXT,
    "weaviateId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Resume_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobPreference" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "desiredRoles" TEXT[],
    "locations" TEXT[],
    "remoteWork" BOOLEAN NOT NULL DEFAULT false,
    "hybridWork" BOOLEAN NOT NULL DEFAULT false,
    "salaryMin" INTEGER,
    "salaryMax" INTEGER,
    "experienceLevel" TEXT,
    "industries" TEXT[],
    "skills" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobPosting" (
    "id" TEXT NOT NULL,
    "recruiterId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "requirements" TEXT[],
    "responsibilities" TEXT[],
    "location" TEXT,
    "remoteWork" BOOLEAN NOT NULL DEFAULT false,
    "hybridWork" BOOLEAN NOT NULL DEFAULT false,
    "salaryMin" INTEGER,
    "salaryMax" INTEGER,
    "experienceLevel" TEXT,
    "employmentType" TEXT,
    "benefits" TEXT[],
    "status" "JobStatus" NOT NULL DEFAULT 'HIRING',
    "moderatedBy" TEXT,
    "moderatedAt" TIMESTAMP(3),
    "weaviateId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobPosting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobApplication" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "applicantId" TEXT NOT NULL,
    "resumeId" TEXT NOT NULL,
    "coverLetter" TEXT,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'APPLIED',
    "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatHistory" (
    "id" TEXT NOT NULL,
    "jobSeekerId" TEXT,
    "recruiterId" TEXT,
    "messages" JSONB[],
    "context" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChatHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmbeddingMetadata" (
    "id" TEXT NOT NULL,
    "weaviateId" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "originalText" TEXT NOT NULL,
    "chunkIndex" INTEGER,
    "totalChunks" INTEGER,
    "model" TEXT NOT NULL,
    "dimensions" INTEGER NOT NULL,
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "version" TEXT NOT NULL DEFAULT '1.0',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmbeddingMetadata_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "JobSeekerProfile_userId_key" ON "JobSeekerProfile"("userId");

-- CreateIndex
CREATE INDEX "JobSeekerProfile_location_idx" ON "JobSeekerProfile"("location");

-- CreateIndex
CREATE INDEX "JobSeekerProfile_userId_idx" ON "JobSeekerProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "RecruiterProfile_userId_key" ON "RecruiterProfile"("userId");

-- CreateIndex
CREATE INDEX "RecruiterProfile_companyName_idx" ON "RecruiterProfile"("companyName");

-- CreateIndex
CREATE INDEX "RecruiterProfile_companyLocation_idx" ON "RecruiterProfile"("companyLocation");

-- CreateIndex
CREATE INDEX "RecruiterProfile_userId_idx" ON "RecruiterProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "AdminProfile_userId_key" ON "AdminProfile"("userId");

-- CreateIndex
CREATE INDEX "AdminProfile_userId_idx" ON "AdminProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Resume_s3Key_key" ON "Resume"("s3Key");

-- CreateIndex
CREATE UNIQUE INDEX "Resume_weaviateId_key" ON "Resume"("weaviateId");

-- CreateIndex
CREATE INDEX "Resume_userId_idx" ON "Resume"("userId");

-- CreateIndex
CREATE INDEX "Resume_extractedText_idx" ON "Resume"("extractedText");

-- CreateIndex
CREATE INDEX "Resume_weaviateId_idx" ON "Resume"("weaviateId");

-- CreateIndex
CREATE UNIQUE INDEX "JobPreference_userId_key" ON "JobPreference"("userId");

-- CreateIndex
CREATE INDEX "JobPreference_userId_idx" ON "JobPreference"("userId");

-- CreateIndex
CREATE INDEX "JobPreference_locations_idx" ON "JobPreference"("locations");

-- CreateIndex
CREATE INDEX "JobPreference_skills_idx" ON "JobPreference"("skills");

-- CreateIndex
CREATE UNIQUE INDEX "JobPosting_weaviateId_key" ON "JobPosting"("weaviateId");

-- CreateIndex
CREATE INDEX "JobPosting_status_idx" ON "JobPosting"("status");

-- CreateIndex
CREATE INDEX "JobPosting_recruiterId_idx" ON "JobPosting"("recruiterId");

-- CreateIndex
CREATE INDEX "JobPosting_title_description_idx" ON "JobPosting"("title", "description");

-- CreateIndex
CREATE INDEX "JobPosting_location_idx" ON "JobPosting"("location");

-- CreateIndex
CREATE INDEX "JobPosting_weaviateId_idx" ON "JobPosting"("weaviateId");

-- CreateIndex
CREATE INDEX "JobPosting_createdAt_idx" ON "JobPosting"("createdAt");

-- CreateIndex
CREATE INDEX "JobApplication_applicantId_idx" ON "JobApplication"("applicantId");

-- CreateIndex
CREATE INDEX "JobApplication_jobId_idx" ON "JobApplication"("jobId");

-- CreateIndex
CREATE INDEX "JobApplication_resumeId_idx" ON "JobApplication"("resumeId");

-- CreateIndex
CREATE INDEX "JobApplication_status_idx" ON "JobApplication"("status");

-- CreateIndex
CREATE INDEX "JobApplication_appliedAt_idx" ON "JobApplication"("appliedAt");

-- CreateIndex
CREATE UNIQUE INDEX "JobApplication_jobId_applicantId_key" ON "JobApplication"("jobId", "applicantId");

-- CreateIndex
CREATE INDEX "ChatHistory_jobSeekerId_idx" ON "ChatHistory"("jobSeekerId");

-- CreateIndex
CREATE INDEX "ChatHistory_recruiterId_idx" ON "ChatHistory"("recruiterId");

-- CreateIndex
CREATE INDEX "ChatHistory_createdAt_idx" ON "ChatHistory"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "EmbeddingMetadata_weaviateId_key" ON "EmbeddingMetadata"("weaviateId");

-- CreateIndex
CREATE INDEX "EmbeddingMetadata_sourceType_sourceId_idx" ON "EmbeddingMetadata"("sourceType", "sourceId");

-- CreateIndex
CREATE INDEX "EmbeddingMetadata_weaviateId_idx" ON "EmbeddingMetadata"("weaviateId");

-- CreateIndex
CREATE INDEX "EmbeddingMetadata_processedAt_idx" ON "EmbeddingMetadata"("processedAt");

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- AddForeignKey
ALTER TABLE "JobSeekerProfile" ADD CONSTRAINT "JobSeekerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecruiterProfile" ADD CONSTRAINT "RecruiterProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminProfile" ADD CONSTRAINT "AdminProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resume" ADD CONSTRAINT "Resume_userId_fkey" FOREIGN KEY ("userId") REFERENCES "JobSeekerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobPreference" ADD CONSTRAINT "JobPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "JobSeekerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobPosting" ADD CONSTRAINT "JobPosting_recruiterId_fkey" FOREIGN KEY ("recruiterId") REFERENCES "RecruiterProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobPosting" ADD CONSTRAINT "JobPosting_moderatedBy_fkey" FOREIGN KEY ("moderatedBy") REFERENCES "AdminProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobApplication" ADD CONSTRAINT "JobApplication_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "JobPosting"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobApplication" ADD CONSTRAINT "JobApplication_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "JobSeekerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobApplication" ADD CONSTRAINT "JobApplication_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatHistory" ADD CONSTRAINT "ChatHistory_jobSeekerId_fkey" FOREIGN KEY ("jobSeekerId") REFERENCES "JobSeekerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatHistory" ADD CONSTRAINT "ChatHistory_recruiterId_fkey" FOREIGN KEY ("recruiterId") REFERENCES "RecruiterProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
