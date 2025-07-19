import { useQuery } from "@tanstack/react-query";
import { api } from "@/config/directory";
import { cacheKeys } from "@/config/cache-keys";
import axios from "@/lib/axios";

export function useCompanyJobListings(companyId: string) {
  return useQuery({
    queryKey: [cacheKeys.companyJobPostings, companyId],
    queryFn: async () => {
      if (!companyId) throw new Error("Company ID is required");
      const res = await axios.get(
        `${api.listJobsByCompany}?userId=${companyId}`
      );
      return res.data;
    },
    enabled: !!companyId, // Only fetch if companyId is provided
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
