import { cacheKeys } from "@/config/cache-keys";
import { api } from "@/config/directory";
import axios from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

interface UseResumeComparisonOptions {
  resumeContent: string | null;
  jobDescription: string | null;
  enabled?: boolean;
}

export const useResumeComparison = ({
  resumeContent,
  jobDescription,
  enabled = true,
}: UseResumeComparisonOptions) => {
  return useQuery({
    queryKey: [cacheKeys.resumeComparison, resumeContent, jobDescription],
    queryFn: async () => {
      if (!resumeContent || !jobDescription)
        throw new Error("Missing resume content or job description");

      const response = await axios.post(api.compareResume, {
        resumeContext: resumeContent,
        jobDescription: jobDescription,
      });

      return response.data; // contains matchScore, matchFeedback, etc.
    },
    enabled: !!resumeContent && !!jobDescription && enabled,
    staleTime: 1000 * 60 * 5, // optional: cache for 5 minutes
  });
};
