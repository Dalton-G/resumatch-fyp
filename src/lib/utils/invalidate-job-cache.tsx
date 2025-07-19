// lib/invalidate-job-postings.ts
import { QueryClient } from "@tanstack/react-query";
import { cacheKeys } from "@/config/cache-keys";

export async function invalidateJobPostingQueries(queryClient: QueryClient) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: [cacheKeys.jobPostings] }),
    queryClient.invalidateQueries({ queryKey: [cacheKeys.myJobPostings] }),
    queryClient.invalidateQueries({ queryKey: [cacheKeys.companyJobPostings] }),
  ]);
}
