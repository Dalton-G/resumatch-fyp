"use client";

import { cacheKeys } from "@/config/cache-keys";
import { api } from "@/config/directory";
import axios from "@/lib/axios";
import { JobApplicationViewResponse } from "@/lib/types/job-application-view-response";
import { useQuery } from "@tanstack/react-query";

export function useJobApplication(id: string) {
  return useQuery<JobApplicationViewResponse, Error>({
    queryKey: [cacheKeys.jobApplication, id],
    queryFn: async () => {
      const response = await axios.get<JobApplicationViewResponse>(
        api.readJobApplication(id)
      );
      return response.data;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });
}
