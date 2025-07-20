"use client";

import axiosInstance from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/config/directory";
import { cacheKeys } from "@/config/cache-keys";

export function useMyJobApplications() {
  return useQuery({
    queryKey: [cacheKeys.myJobApplications],
    queryFn: async () => {
      try {
        const response = await axiosInstance.get(api.getMyJobApplications);
        console.log(
          "Fetched user's job applications:",
          response.data.applications
        );
        return response.data.applications;
      } catch (error) {
        console.error("Error fetching user's job applications:", error);
        throw error;
      }
    },
    retry: 2,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
