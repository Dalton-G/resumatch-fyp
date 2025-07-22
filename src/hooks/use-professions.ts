"use client";

import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { api } from "@/config/directory";
import { cacheKeys } from "@/config/cache-keys";

export function useProfessions() {
  return useQuery({
    queryKey: [cacheKeys.professions],
    queryFn: async (): Promise<string[]> => {
      const response = await axiosInstance.get(api.professions);
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - professions don't change often
    refetchOnWindowFocus: false,
    retry: 2,
  });
}
