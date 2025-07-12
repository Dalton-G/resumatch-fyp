-- AddForeignKey
ALTER TABLE "ResumeChunk" ADD CONSTRAINT "ResumeChunk_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobPostingChunk" ADD CONSTRAINT "JobPostingChunk_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "JobPosting"("id") ON DELETE CASCADE ON UPDATE CASCADE;
