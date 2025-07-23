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

export async function invalidateJobApplicationQueries(
  queryClient: QueryClient
) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: [cacheKeys.myJobApplications] }),
    queryClient.invalidateQueries({ queryKey: [cacheKeys.jobApplication] }),
    queryClient.invalidateQueries({ queryKey: [cacheKeys.appliedJobDetails] }),
    queryClient.invalidateQueries({
      queryKey: [cacheKeys.jobApplicationStatus],
    }),
    queryClient.invalidateQueries({ queryKey: [cacheKeys.jobApplicants] }),
    queryClient.invalidateQueries({ queryKey: [cacheKeys.jobMatching] }),
    queryClient.invalidateQueries({ queryKey: [cacheKeys.jobSeekerAnalytics] }),
  ]);
}
