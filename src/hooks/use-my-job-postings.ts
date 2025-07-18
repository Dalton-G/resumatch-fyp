"use client";

import axiosInstance from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/config/directory";
import { cacheKeys } from "@/config/cache-keys";

export function useMyJobPostings() {
  return useQuery({
    queryKey: [cacheKeys.myJobPostings],
    queryFn: async () => {
      try {
        const response = await axiosInstance.get(api.getMyJobPostings);
        return response.data;
      } catch (error) {
        console.error("Error fetching job postings:", error);
        throw error;
      }
    },
    retry: 2,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
