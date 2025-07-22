"use client";

import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { api } from "@/config/directory";
import { cacheKeys } from "@/config/cache-keys";
import type {
  RankApplicantsRequest,
  RankApplicantsResponse,
} from "@/schema/rank-applicants-schema";

interface UseRankApplicantsProps {
  request: RankApplicantsRequest;
  enabled: boolean;
}

export function useRankApplicants({
  request,
  enabled,
}: UseRankApplicantsProps) {
  return useQuery({
    queryKey: [cacheKeys.rankApplicants, request],
    queryFn: async (): Promise<RankApplicantsResponse> => {
      const response = await axiosInstance.post(api.rankApplicants, request);
      return response.data;
    },
    enabled: enabled && !!request.jobId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 2,
  });
}
