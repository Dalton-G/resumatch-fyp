import { cacheKeys } from "@/config/cache-keys";
import { api } from "@/config/directory";
import axios from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

export function useJobDetails(jobId: string) {
  return useQuery({
    queryKey: [cacheKeys.jobView, jobId],
    queryFn: async () => {
      const res = await axios.get(api.viewJob(jobId));
      return res.data;
    },
    enabled: !!jobId, // Only fetch if jobId is provided
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
