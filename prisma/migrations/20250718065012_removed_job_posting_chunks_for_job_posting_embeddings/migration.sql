/*
  Warnings:

  - You are about to drop the `JobPostingChunk` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "JobPostingChunk" DROP CONSTRAINT "JobPostingChunk_jobId_fkey";

-- DropTable
DROP TABLE "JobPostingChunk";

-- CreateTable
CREATE TABLE "JobPostingEmbedding" (
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

    CONSTRAINT "JobPostingEmbedding_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "JobPostingEmbedding_jobId_key" ON "JobPostingEmbedding"("jobId");

-- CreateIndex
CREATE INDEX "JobPostingEmbedding_companyId_idx" ON "JobPostingEmbedding"("companyId");

-- CreateIndex
CREATE INDEX "JobPostingEmbedding_jobId_idx" ON "JobPostingEmbedding"("jobId");

-- CreateIndex
CREATE INDEX "JobPostingEmbedding_active_idx" ON "JobPostingEmbedding"("active");

-- AddForeignKey
ALTER TABLE "JobPostingEmbedding" ADD CONSTRAINT "JobPostingEmbedding_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "JobPosting"("id") ON DELETE CASCADE ON UPDATE CASCADE;
