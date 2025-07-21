"use client";

import { cacheKeys } from "@/config/cache-keys";
import { api } from "@/config/directory";
import axios from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

interface UseCheckJobOwnershipOptions {
  jobId: string | null;
  enabled?: boolean;
}

export const useCheckJobOwnership = ({
  jobId,
  enabled = true,
}: UseCheckJobOwnershipOptions) => {
  return useQuery({
    queryKey: [cacheKeys.jobOwnership, jobId],
    queryFn: async () => {
      if (!jobId) throw new Error("Missing jobId");

      const response = await axios.get<{ ownsJobPosting: boolean }>(
        `${api.checkJobOwnership}?jobId=${jobId}`
      );

      return response.data.ownsJobPosting;
    },
    enabled: !!jobId && enabled,
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });
};
