"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  User,
} from "lucide-react";
import { useJobReports, useResolveJobReport } from "@/hooks/use-job-reports";
import { JobReportResponse } from "@/types/job-reports";
import Heading from "@/components/custom/heading";
import { formatDistanceToNow } from "date-fns";

interface ReportResolution {
  status: "RESOLVED_VALID" | "RESOLVED_INVALID" | "DISMISSED";
  adminNotes?: string;
}

const statusColors = {
  PENDING: "bg-yellow-100 text-yellow-800",
  UNDER_REVIEW: "bg-blue-100 text-blue-800",
  RESOLVED_VALID: "bg-green-100 text-green-800",
  RESOLVED_INVALID: "bg-gray-100 text-gray-800",
  DISMISSED: "bg-red-100 text-red-800",
};

const statusIcons = {
  PENDING: Clock,
  UNDER_REVIEW: Eye,
  RESOLVED_VALID: CheckCircle,
  RESOLVED_INVALID: XCircle,
  DISMISSED: XCircle,
};

export default function ManageReportsPage() {
  const [activeTab, setActiveTab] = useState("pending");
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] =
    useState<JobReportResponse | null>(null);
  const [resolutionData, setResolutionData] = useState<ReportResolution>({
    status: "RESOLVED_VALID",
    adminNotes: "",
  });

  // Fetch job reports
  const { data: reports, isLoading } = useJobReports(
    activeTab === "pending"
      ? "PENDING,UNDER_REVIEW"
      : activeTab === "resolved"
      ? "RESOLVED_VALID,RESOLVED_INVALID,DISMISSED"
      : undefined,
    50
  );

  // Resolve report mutation
  const resolveReportMutation = useResolveJobReport();

  // Handle successful resolution
  const handleResolveSuccess = () => {
    setResolveDialogOpen(false);
    setSelectedReport(null);
    setResolutionData({ status: "RESOLVED_VALID", adminNotes: "" });
  };

  const handleResolveReport = () => {
    if (!selectedReport) return;

    resolveReportMutation.mutate(
      {
        reportId: selectedReport.id,
        status: resolutionData.status,
        adminNotes: resolutionData.adminNotes,
      },
      {
        onSuccess: handleResolveSuccess,
      }
    );
  };

  const getReportsByStatus = (
    reports: JobReportResponse[],
    status: string[]
  ) => {
    return reports?.filter((report) => status.includes(report.status)) || [];
  };

  const pendingReports = getReportsByStatus(reports?.reports || [], [
    "PENDING",
    "UNDER_REVIEW",
  ]);
  const resolvedReports = getReportsByStatus(reports?.reports || [], [
    "RESOLVED_VALID",
    "RESOLVED_INVALID",
    "DISMISSED",
  ]);

  const renderReportCard = (report: JobReportResponse) => {
    const StatusIcon = statusIcons[report.status as keyof typeof statusIcons];

    return (
      <Card key={report.id} className="mb-4">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg font-semibold mb-2">
                {report.job.title}
              </CardTitle>
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <User className="w-4 h-4" />
                <span>{report.job.companyName}</span>
                <span>•</span>
                <span>Reported by {report.reporter.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  className={
                    statusColors[report.status as keyof typeof statusColors]
                  }
                >
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {report.status.replace("_", " ")}
                </Badge>
                <span className="text-sm text-gray-500">
                  {formatDistanceToNow(new Date(report.createdAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            </div>
            {(report.status === "PENDING" ||
              report.status === "UNDER_REVIEW") && (
              <AlertDialog
                open={resolveDialogOpen && selectedReport?.id === report.id}
                onOpenChange={setResolveDialogOpen}
              >
                <AlertDialogTrigger asChild>
                  <Button
                    onClick={() => {
                      setSelectedReport(report);
                      setResolutionData({
                        status: "RESOLVED_VALID",
                        adminNotes: "",
                      });
                      setResolveDialogOpen(true);
                    }}
                    variant="outline"
                    size="sm"
                  >
                    Resolve
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="max-w-md">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Resolve Report</AlertDialogTitle>
                    <AlertDialogDescription>
                      Choose how to resolve this job posting report.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Resolution
                      </label>
                      <Select
                        value={resolutionData.status}
                        onValueChange={(value) =>
                          setResolutionData((prev) => ({
                            ...prev,
                            status: value as ReportResolution["status"],
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="RESOLVED_VALID">
                            Valid - Close Job
                          </SelectItem>
                          <SelectItem value="RESOLVED_INVALID">
                            Invalid - Keep Job Active
                          </SelectItem>
                          <SelectItem value="DISMISSED">
                            Dismiss Report
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Admin Notes (Optional)
                      </label>
                      <Textarea
                        value={resolutionData.adminNotes}
                        onChange={(e) =>
                          setResolutionData((prev) => ({
                            ...prev,
                            adminNotes: e.target.value,
                          }))
                        }
                        placeholder="Add any notes about this resolution..."
                        rows={3}
                      />
                    </div>
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel
                      onClick={() => {
                        setResolveDialogOpen(false);
                        setSelectedReport(null);
                        setResolutionData({
                          status: "RESOLVED_VALID",
                          adminNotes: "",
                        });
                      }}
                    >
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleResolveReport}
                      disabled={resolveReportMutation.isPending}
                    >
                      {resolveReportMutation.isPending
                        ? "Resolving..."
                        : "Resolve"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">Reason:</p>
              <Badge variant="outline" className="text-xs">
                {report.reason.replace("_", " ")}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">
                Description:
              </p>
              <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                {report.description || "No description provided"}
              </p>
            </div>
            {report.adminNotes && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">
                  Admin Notes:
                </p>
                <p className="text-sm text-gray-600 bg-blue-50 p-2 rounded">
                  {report.adminNotes}
                </p>
              </div>
            )}
            {report.resolvedAt && (
              <div className="text-xs text-gray-500">
                Resolved{" "}
                {formatDistanceToNow(new Date(report.resolvedAt), {
                  addSuffix: true,
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div>
      <Heading title="Manage Reports" />
      <div className="p-6 max-h-[calc(100vh-6.5rem)] overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 bg-white h-12">
              <TabsTrigger
                value="pending"
                className="flex items-center gap-2 justify-center py-2 rounded-md
        data-[state=active]:bg-[var(--r-blue)]
        data-[state=active]:text-white
        data-[state=inactive]:text-gray-700
        transition-colors"
              >
                <AlertTriangle className="w-4 h-4" />
                Pending ({pendingReports.length})
              </TabsTrigger>
              <TabsTrigger
                value="resolved"
                className="flex items-center gap-2 justify-center py-2 rounded-md
        data-[state=active]:bg-[var(--r-blue)]
        data-[state=active]:text-white
        data-[state=inactive]:text-gray-700
        transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                Resolved ({resolvedReports.length})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="pending" className="mt-6">
              {isLoading ? (
                <div className="text-center py-8">Loading reports...</div>
              ) : pendingReports.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No pending reports to review
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingReports.map(renderReportCard)}
                </div>
              )}
            </TabsContent>
            <TabsContent value="resolved" className="mt-6">
              {isLoading ? (
                <div className="text-center py-8">Loading reports...</div>
              ) : resolvedReports.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No resolved reports found
                </div>
              ) : (
                <div className="space-y-4">
                  {resolvedReports.map(renderReportCard)}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
