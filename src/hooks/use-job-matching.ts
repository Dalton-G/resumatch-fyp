import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { api } from "@/config/directory";
import { cacheKeys } from "@/config/cache-keys";

interface JobMatchingFilters {
  salaryMin?: number;
  salaryMax?: number;
  position?: string;
  workType?: string;
  country?: string;
  amount: number;
}

interface UseJobMatchingProps {
  resumeId: string;
  filters: JobMatchingFilters;
  enabled: boolean;
}

export function useJobMatching({
  resumeId,
  filters,
  enabled,
}: UseJobMatchingProps) {
  return useQuery({
    queryKey: [cacheKeys.jobMatching, resumeId, filters],
    queryFn: async () => {
      const res = await axiosInstance.post(api.jobMatching, {
        resumeId,
        filters,
      });
      return res.data;
    },
    enabled: enabled && !!resumeId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}
