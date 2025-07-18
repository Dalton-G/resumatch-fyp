/*
  Warnings:

  - You are about to drop the column `chunkIndex` on the `JobPostingEmbedding` table. All the data in the column will be lost.
  - You are about to drop the column `totalChunks` on the `JobPostingEmbedding` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "JobPostingEmbedding" DROP COLUMN "chunkIndex",
DROP COLUMN "totalChunks";
