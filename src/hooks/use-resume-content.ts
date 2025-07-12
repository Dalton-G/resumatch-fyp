import { cacheKeys } from "@/config/cache-keys";
import { api } from "@/config/directory";
import axios from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

interface UseCurrentResumeContentOptions {
  s3Url: string | null;
  enabled?: boolean;
}

export const useCurrentResumeContent = ({
  s3Url,
  enabled = true,
}: UseCurrentResumeContentOptions) => {
  return useQuery({
    queryKey: [cacheKeys.resumeContent, s3Url],
    queryFn: async () => {
      if (!s3Url) throw new Error("Missing S3 URL");

      const response = await axios.post(api.extractResumeText, {
        url: s3Url,
      });

      const data = response.data;
      return data.text as string;
    },
    enabled: !!s3Url && enabled,
    staleTime: 1000 * 60 * 5, // cache for 5 minutes
  });
};
