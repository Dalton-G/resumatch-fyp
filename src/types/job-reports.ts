// Job Report API Response Types
export interface JobReportResponse {
  id: string;
  reason: string;
  description: string | null;
  status: ReportStatus;
  adminNotes: string | null;
  createdAt: string;
  resolvedAt: string | null;
  job: {
    id: string;
    title: string;
    status: string;
    companyName: string;
  };
  reporter: {
    id: string;
    name: string;
    email: string;
  };
  resolvedBy: string | null;
}

export interface JobReportsListResponse {
  reports: JobReportResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateJobReportRequest {
  jobId: string;
  reason: string;
  description: string;
}

export interface CreateJobReportResponse {
  success: boolean;
  message: string;
  reportId: string;
}

export interface ResolveJobReportRequest {
  status: "RESOLVED_VALID" | "RESOLVED_INVALID" | "DISMISSED";
  adminNotes?: string;
}

export interface ResolveJobReportResponse {
  success: boolean;
  message: string;
  report: {
    id: string;
    status: string;
    adminNotes: string | null;
    resolvedAt: string;
    jobTitle: string;
    companyName: string;
    reporterName: string;
    jobClosed: boolean;
  };
}

export type ReportStatus =
  | "PENDING"
  | "UNDER_REVIEW"
  | "RESOLVED_VALID"
  | "RESOLVED_INVALID"
  | "DISMISSED";

export type ReportReason =
  | "SPAM"
  | "INAPPROPRIATE_CONTENT"
  | "MISLEADING_INFORMATION"
  | "DISCRIMINATION"
  | "FAKE_JOB"
  | "OTHER";
