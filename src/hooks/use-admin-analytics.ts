"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import { api } from "@/config/directory";
import { cacheKeys } from "@/config/cache-keys";

interface AdminAnalytics {
  adminName: string;
  totalUsers: number;
  newUsersInRange: number;
  totalApplications: number;
  geographicCount: number;
  userRoleDistribution: Array<{
    role: string;
    name: string;
    count: number;
    percentage: number;
  }>;
  userApprovalStatus: Array<{
    status: string;
    name: string;
    count: number;
    percentage: number;
  }>;
  userGrowthTimeline: Array<{
    date: string;
    users: number;
    dateFormatted: string;
  }>;
  jobStatusDistribution: Array<{
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
  popularIndustries: Array<{
    industry: string;
    companies: number;
  }>;
  geographicDistribution: Array<{
    country: string;
    users: number;
  }>;
  recentRegistrations: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    isApproved: boolean;
    createdAt: Date;
  }>;
  topCompaniesByPerformance: Array<{
    companyId: string;
    companyName: string;
    industry: string;
    jobPostings: number;
    totalApplications: number;
  }>;
  trendingSkills: Array<{
    skill: string;
    count: number;
  }>;
  trendingJobs: Array<{
    jobTitle: string;
    count: number;
  }>;
  timeRange: number;
  dateRange: {
    from: string;
    to: string;
  };
}

interface AdminAnalyticsResponse {
  analytics: AdminAnalytics;
}

export function useAdminAnalytics(timeRange: string) {
  return useQuery<AdminAnalyticsResponse>({
    queryKey: [cacheKeys.adminAnalytics, timeRange],
    queryFn: async () => {
      const response = await axios.get(
        `${api.adminAnalytics}?timeRange=${timeRange}`
      );
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}
