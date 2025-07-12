import { useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { api } from "@/config/directory";
import { cacheKeys } from "@/config/cache-keys";

export function useMyResume() {
  return useQuery({
    queryKey: [cacheKeys.myResumeList],
    queryFn: async () => {
      const res = await axiosInstance.get(api.jobSeekerResume);
      return res.data.resumes || [];
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useInvalidateMyResume() {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({ queryKey: [cacheKeys.myResumeList] });
}
