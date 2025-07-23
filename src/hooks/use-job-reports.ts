import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "@/lib/axios";
import { cacheKeys } from "@/config/cache-keys";
import {
  JobReportsListResponse,
  CreateJobReportRequest,
  CreateJobReportResponse,
  ResolveJobReportRequest,
  ResolveJobReportResponse,
} from "@/types/job-reports";

// Hook to fetch job reports for admin
export function useJobReports(
  status?: string,
  limit?: number,
  offset?: number
) {
  return useQuery<JobReportsListResponse>({
    queryKey: [cacheKeys.jobReports, { status, limit, offset }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (status) params.append("status", status);
      if (limit) params.append("limit", limit.toString());
      if (offset) params.append("offset", offset.toString());

      const response = await axios.get<JobReportsListResponse>(
        `/api/job-reports/list?${params}`
      );
      return response.data;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

// Hook to create a job report
export function useCreateJobReport() {
  const queryClient = useQueryClient();

  return useMutation<CreateJobReportResponse, Error, CreateJobReportRequest>({
    mutationFn: async (data: CreateJobReportRequest) => {
      const response = await axios.post<CreateJobReportResponse>(
        "/api/job-reports/create",
        data
      );
      return response.data;
    },
    onSuccess: () => {
      // Invalidate job reports cache
      queryClient.invalidateQueries({ queryKey: [cacheKeys.jobReports] });
    },
  });
}

// Hook to resolve a job report (admin only)
export function useResolveJobReport() {
  const queryClient = useQueryClient();

  return useMutation<
    ResolveJobReportResponse,
    Error,
    {
      reportId: string;
      status: ResolveJobReportRequest["status"];
      adminNotes?: string;
    }
  >({
    mutationFn: async (data: {
      reportId: string;
      status: ResolveJobReportRequest["status"];
      adminNotes?: string;
    }) => {
      const response = await axios.patch<ResolveJobReportResponse>(
        `/api/job-reports/${data.reportId}/resolve`,
        {
          status: data.status,
          adminNotes: data.adminNotes,
        }
      );
      return response.data;
    },
    onSuccess: () => {
      // Invalidate job reports cache
      queryClient.invalidateQueries({ queryKey: [cacheKeys.jobReports] });
      // Also invalidate job listings cache in case job was closed
      queryClient.invalidateQueries({ queryKey: [cacheKeys.jobPostings] });
    },
  });
}
