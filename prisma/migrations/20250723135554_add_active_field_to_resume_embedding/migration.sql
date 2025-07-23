-- AlterTable
ALTER TABLE "ResumeEmbedding" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE INDEX "ResumeEmbedding_active_idx" ON "ResumeEmbedding"("active");
