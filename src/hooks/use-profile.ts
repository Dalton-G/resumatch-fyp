"use client";

import axiosInstance from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/config/directory";

export function useCurrentUserProfile(userId: string, role: string) {
  return useQuery({
    queryKey: ["profile", userId, role],
    queryFn: async () => {
      try {
        const response = await axiosInstance.get(
          `${api.profile}?userId=${userId}&role=${role}`
        );
        return response.data.profile;
      } catch (error) {
        console.error("Error fetching profile:", error);
        throw error;
      }
    },
    retry: 2,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
