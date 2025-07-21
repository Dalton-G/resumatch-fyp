"use client";

import { cacheKeys } from "@/config/cache-keys";
import { api } from "@/config/directory";
import axios from "@/lib/axios";
import { JobApplicantsResponse } from "@/lib/types/job-applicants-view-response";
import { useQuery } from "@tanstack/react-query";

export function useJobApplicants(jobId: string) {
  return useQuery<JobApplicantsResponse, Error>({
    queryKey: [cacheKeys.jobApplicants, jobId],
    queryFn: async () => {
      const response = await axios.get<JobApplicantsResponse>(
        api.getJobApplicants(jobId)
      );
      return response.data;
    },
    enabled: !!jobId,
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });
}
