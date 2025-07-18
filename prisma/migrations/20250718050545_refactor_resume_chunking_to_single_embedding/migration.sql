/*
  Warnings:

  - You are about to drop the `ResumeChunk` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ResumeChunk" DROP CONSTRAINT "ResumeChunk_resumeId_fkey";

-- DropTable
DROP TABLE "ResumeChunk";

-- CreateTable
CREATE TABLE "ResumeEmbedding" (
    "id" TEXT NOT NULL,
    "jobSeekerId" TEXT NOT NULL,
    "resumeId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "embedding" DOUBLE PRECISION[],
    "appliedJobIds" TEXT[],
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResumeEmbedding_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ResumeEmbedding_resumeId_key" ON "ResumeEmbedding"("resumeId");

-- CreateIndex
CREATE INDEX "ResumeEmbedding_jobSeekerId_idx" ON "ResumeEmbedding"("jobSeekerId");

-- CreateIndex
CREATE INDEX "ResumeEmbedding_resumeId_idx" ON "ResumeEmbedding"("resumeId");

-- AddForeignKey
ALTER TABLE "ResumeEmbedding" ADD CONSTRAINT "ResumeEmbedding_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE CASCADE ON UPDATE CASCADE;
