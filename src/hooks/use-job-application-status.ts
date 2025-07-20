import { cacheKeys } from "@/config/cache-keys";
import { api } from "@/config/directory";
import axios from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

export function useJobApplicationStatus(jobId: string) {
  return useQuery({
    queryKey: [cacheKeys.jobApplicationStatus, jobId],
    queryFn: async () => {
      const response = await axios.get<{ hasApplied: boolean }>(
        api.hasAppliedForJob(jobId)
      );
      return response.data.hasApplied;
    },
    enabled: !!jobId, // only run if jobId is defined
  });
}
