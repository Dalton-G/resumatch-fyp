import { useQueries } from "@tanstack/react-query";
import { api } from "@/config/directory";
import axios from "@/lib/axios";
import { JobApplication } from "@prisma/client";

export function useJobDetailsForApplications(applications: JobApplication[]) {
  // Only run if applications exist
  const queries = useQueries({
    queries: (applications || []).map((application) => ({
      queryKey: ["job-details", application.jobId],
      queryFn: async () => {
        const res = await axios.get(api.viewJob(application.jobId));
        return res.data;
      },
      enabled: !!application.jobId,
      staleTime: 5 * 60 * 1000,
    })),
  });
  return queries;
}
