"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import { api } from "@/config/directory";
import { cacheKeys } from "@/config/cache-keys";

interface JobSeekerAnalytics {
  firstName: string;
  lastName: string;
  totalApplications: number;
  profileViews: number;
  resumeCount: number;
  skillsCount: number;
  statusBreakdown: Array<{
    status: string;
    name: string;
    count: number;
    percentage: number;
  }>;
  applicationTimeline: Array<{
    date: string;
    applications: number;
    dateFormatted: string;
  }>;
  recentApplications: Array<{
    id: string;
    jobTitle: string;
    company: string;
    status: string;
    appliedAt: Date;
  }>;
  timeRange: number;
  dateRange: {
    from: string;
    to: string;
  };
}

export function useJobSeekerAnalytics(timeRange: string = "30") {
  return useQuery<{ analytics: JobSeekerAnalytics }, Error>({
    queryKey: [cacheKeys.jobSeekerAnalytics, timeRange],
    queryFn: async () => {
      const response = await axios.get<{ analytics: JobSeekerAnalytics }>(
        `${api.jobSeekerAnalytics}?timeRange=${timeRange}`
      );
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
}
