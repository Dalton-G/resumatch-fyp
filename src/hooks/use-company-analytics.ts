import { api } from "@/config/directory";
import { cacheKeys } from "@/config/cache-keys";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

interface CompanyAnalytics {
  companyName: string;
  activeJobPostings: number;
  totalApplications: number;
  applicationsThisMonth: number;
  companyProfileViews: number;
  averageTimeToFill: number;
  statusBreakdown: Array<{
    status: string;
    name: string;
    count: number;
    percentage: number;
  }>;
  jobStatusDistribution: Array<{
    status: string;
    name: string;
    count: number;
    percentage: number;
  }>;
  applicationsByJob: Array<{
    jobId: string;
    jobTitle: string;
    applications: number;
  }>;
  topPerformingJobs: Array<{
    jobId: string;
    jobTitle: string;
    applications: number;
    views: number;
  }>;
  applicationTimeline: Array<{
    date: string;
    applications: number;
    dateFormatted: string;
  }>;
  recentApplications: Array<{
    id: string;
    candidateName: string;
    jobTitle: string;
    profession: string | null;
    profilePicture: string | null;
    status: string;
    appliedAt: Date;
  }>;
  timeRange: number;
  dateRange: {
    from: string;
    to: string;
  };
}

interface CompanyAnalyticsResponse {
  analytics: CompanyAnalytics;
}

export function useCompanyAnalytics(timeRange: string) {
  return useQuery<CompanyAnalyticsResponse>({
    queryKey: [cacheKeys.companyAnalytics, timeRange],
    queryFn: async () => {
      const response = await axios.get(
        `${api.companyAnalytics}?timeRange=${timeRange}`
      );
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}
