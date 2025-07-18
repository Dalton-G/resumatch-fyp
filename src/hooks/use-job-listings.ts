import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { api } from "@/config/directory";
import { cacheKeys } from "@/config/cache-keys";

export function useJobListings() {
  return useQuery({
    queryKey: [cacheKeys.jobPostings],
    queryFn: async () => {
      const res = await axios.get(api.listJobs);
      return res.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
