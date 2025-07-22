"use client";

import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { api } from "@/config/directory";
import { cacheKeys } from "@/config/cache-keys";

export interface JobWithApplicants {
  id: string;
  title: string;
  applicantCount: number;
}

export function useJobsWithApplicants() {
  return useQuery({
    queryKey: [cacheKeys.jobsWithApplicants],
    queryFn: async (): Promise<JobWithApplicants[]> => {
      const response = await axiosInstance.get(api.jobsWithApplicants);
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: false,
    retry: 2,
  });
}
