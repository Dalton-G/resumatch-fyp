-- CreateTable
CREATE TABLE "ResumeChunk" (
    "id" TEXT NOT NULL,
    "jobSeekerId" TEXT NOT NULL,
    "resumeId" TEXT NOT NULL,
    "chunkIndex" INTEGER NOT NULL,
    "totalChunks" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "embedding" DOUBLE PRECISION[],
    "appliedJobIds" TEXT[],
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResumeChunk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobPostingChunk" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "chunkIndex" INTEGER NOT NULL,
    "totalChunks" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "embedding" DOUBLE PRECISION[],
    "active" BOOLEAN NOT NULL DEFAULT true,
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobPostingChunk_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ResumeChunk_jobSeekerId_idx" ON "ResumeChunk"("jobSeekerId");

-- CreateIndex
CREATE INDEX "ResumeChunk_resumeId_idx" ON "ResumeChunk"("resumeId");

-- CreateIndex
CREATE INDEX "JobPostingChunk_companyId_idx" ON "JobPostingChunk"("companyId");

-- CreateIndex
CREATE INDEX "JobPostingChunk_jobId_idx" ON "JobPostingChunk"("jobId");

-- CreateIndex
CREATE INDEX "JobPostingChunk_active_idx" ON "JobPostingChunk"("active");
