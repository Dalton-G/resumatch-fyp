"use client";

import { useState, useEffect } from "react";
import axios from "@/lib/axios";
import { pages, api } from "@/config/directory";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Heading from "@/components/custom/heading";
import { toast } from "sonner";
import {
  Search,
  Briefcase,
  Activity,
  XCircle,
  ExternalLink,
  Trash2,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { JobStatus, WorkType } from "@prisma/client";

interface AdminJobPosting {
  id: string;
  title: string;
  status: JobStatus;
  workType: WorkType;
  country: string;
  applicantCount: number;
  views: number;
  createdAt: string;
  company: {
    id: string;
    name: string;
    profilePicture: string | null;
  };
}

interface AdminJobsResponse {
  jobs: AdminJobPosting[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
}

export default function ManageJobsPage() {
  const [jobs, setJobs] = useState<AdminJobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | JobStatus>("all");
  const [workTypeFilter, setWorkTypeFilter] = useState<"all" | WorkType>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const router = useRouter();
  const jobsPerPage = 10;

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: jobsPerPage.toString(),
        search: searchTerm,
        status: statusFilter,
        workType: workTypeFilter,
      });

      const response = await axios.get(`${api.adminJobs}?${params}`);
      const data: AdminJobsResponse = response.data;

      setJobs(data.jobs);
      setTotalPages(data.totalPages);
      setTotalCount(data.totalCount);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      toast.error("Failed to fetch jobs. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [currentPage, searchTerm, statusFilter, workTypeFilter]);

  const handleToggleJobStatus = async (
    jobId: string,
    jobTitle: string,
    currentStatus: JobStatus
  ) => {
    setActionLoading(jobId);
    try {
      const response = await axios.post(api.toggleJobStatus(jobId));

      await fetchJobs(); // Refresh the list

      const actionWord =
        currentStatus === "CLOSED_BY_ADMIN" ? "enabled" : "disabled";
      toast.success(`${jobTitle} has been successfully ${actionWord}.`);
    } catch (error) {
      console.error("Error toggling job status:", error);
      toast.error("Failed to toggle job status. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteJob = async (jobId: string, jobTitle: string) => {
    setActionLoading(jobId);
    try {
      await axios.delete(api.adminDeleteJob(jobId));

      await fetchJobs(); // Refresh the list
      toast.success(`${jobTitle} has been successfully deleted.`);
    } catch (error) {
      console.error("Error deleting job:", error);
      toast.error("Failed to delete job. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadgeColor = (status: JobStatus) => {
    const colors = {
      HIRING: "bg-green-600 text-white",
      URGENTLY_HIRING: "bg-blue-600 text-white",
      CLOSED: "bg-gray-600 text-white",
      CLOSED_BY_ADMIN: "bg-red-600 text-white",
    };
    return colors[status] || "bg-gray-600 text-white";
  };

  const getStatusLabel = (status: JobStatus) => {
    const labels = {
      HIRING: "Hiring",
      URGENTLY_HIRING: "Urgent",
      CLOSED: "Closed",
      CLOSED_BY_ADMIN: "Disabled",
    };
    return labels[status] || status;
  };

  const getWorkTypeLabel = (workType: WorkType) => {
    const labels = {
      ONSITE: "Onsite",
      REMOTE: "Remote",
      HYBRID: "Hybrid",
    };
    return labels[workType] || workType;
  };

  const handleRowClick = (jobId: string) => {
    router.push(pages.viewJob(jobId));
  };

  const isJobDisabled = (status: JobStatus) => status === "CLOSED_BY_ADMIN";

  return (
    <div className="font-libertinus">
      <Heading title="Manage Jobs" />

      <div className="max-h-[calc(100vh-6.5rem)] overflow-y-auto">
        <div className="max-w-7xl mx-auto py-6 space-y-6">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-lg font-normal font-dm-serif">
                  Total Jobs
                </CardTitle>
                <Briefcase className="h-6 w-6 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold font-dm-serif">
                  {totalCount}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-lg font-normal font-dm-serif">
                  Active Jobs
                </CardTitle>
                <Activity className="h-6 w-6 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-green-600 font-dm-serif">
                  {
                    jobs.filter(
                      (j) =>
                        j.status === "HIRING" || j.status === "URGENTLY_HIRING"
                    ).length
                  }
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-lg font-normal font-dm-serif">
                  Disabled Jobs
                </CardTitle>
                <XCircle className="h-6 w-6 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-red-600 font-dm-serif">
                  {jobs.filter((j) => j.status === "CLOSED_BY_ADMIN").length}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="font-dm-serif font-normal text-xl">
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by job title or company..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="pl-8"
                    />
                  </div>
                </div>
                <Select
                  value={statusFilter}
                  onValueChange={(value: "all" | JobStatus) => {
                    setStatusFilter(value);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="HIRING">Hiring</SelectItem>
                    <SelectItem value="URGENTLY_HIRING">Urgent</SelectItem>
                    <SelectItem value="CLOSED">Closed</SelectItem>
                    <SelectItem value="CLOSED_BY_ADMIN">Disabled</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={workTypeFilter}
                  onValueChange={(value: "all" | WorkType) => {
                    setWorkTypeFilter(value);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter by work type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Work Types</SelectItem>
                    <SelectItem value="ONSITE">Onsite</SelectItem>
                    <SelectItem value="REMOTE">Remote</SelectItem>
                    <SelectItem value="HYBRID">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Jobs Table */}
          <Card>
            <CardHeader>
              <CardTitle className="font-dm-serif font-normal text-xl">
                Jobs ({totalCount})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading jobs...</div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Job Title</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Work Type</TableHead>
                        <TableHead>Applications</TableHead>
                        <TableHead>Posted</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {jobs.map((job) => (
                        <TableRow
                          key={job.id}
                          className="cursor-pointer hover:bg-gray-50"
                          onClick={() => handleRowClick(job.id)}
                        >
                          <TableCell>
                            <div className="font-medium flex items-center gap-2">
                              {job.title}
                              <ExternalLink className="h-4 w-4 text-gray-400" />
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {job.company.profilePicture && (
                                <img
                                  src={job.company.profilePicture}
                                  alt={job.company.name}
                                  className="w-6 h-6 rounded-full"
                                />
                              )}
                              {job.company.name}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={cn(
                                "py-1 px-2 rounded-full",
                                getStatusBadgeColor(job.status)
                              )}
                            >
                              {getStatusLabel(job.status)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {getWorkTypeLabel(job.workType)}
                            </Badge>
                          </TableCell>
                          <TableCell>{job.applicantCount}</TableCell>
                          <TableCell>{formatDate(job.createdAt)}</TableCell>
                          <TableCell>
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="flex gap-2"
                            >
                              {/* Toggle Status Button */}
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={actionLoading === job.id}
                                    className={cn(
                                      "border-[var(--r-blue)] text-[var(--r-blue)] hover:bg-[var(--r-blue)] hover:text-white",
                                      isJobDisabled(job.status) &&
                                        "border-green-600 text-green-600 hover:bg-green-600"
                                    )}
                                  >
                                    {actionLoading === job.id ? (
                                      "..."
                                    ) : isJobDisabled(job.status) ? (
                                      <>
                                        <ToggleRight className="h-4 w-4 mr-1" />
                                        Enable
                                      </>
                                    ) : (
                                      <>
                                        <ToggleLeft className="h-4 w-4 mr-1" />
                                        Disable
                                      </>
                                    )}
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="font-libertinus">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle className="font-dm-serif font-normal text-xl">
                                      {isJobDisabled(job.status)
                                        ? "Enable Job"
                                        : "Disable Job"}
                                    </AlertDialogTitle>
                                    <AlertDialogDescription className="text-md">
                                      Are you sure you want to{" "}
                                      {isJobDisabled(job.status)
                                        ? "enable"
                                        : "disable"}{" "}
                                      "{job.title}"? This will{" "}
                                      {isJobDisabled(job.status)
                                        ? "make it visible and allow applications"
                                        : "hide it from search results and prevent new applications"}
                                      .
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() =>
                                        handleToggleJobStatus(
                                          job.id,
                                          job.title,
                                          job.status
                                        )
                                      }
                                      className={cn(
                                        isJobDisabled(job.status)
                                          ? "bg-green-600 hover:bg-green-700"
                                          : "bg-[var(--r-blue)] hover:bg-[var(--r-blue)]/80"
                                      )}
                                    >
                                      {isJobDisabled(job.status)
                                        ? "Enable Job"
                                        : "Disable Job"}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>

                              {/* Delete Button */}
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={actionLoading === job.id}
                                    className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                                  >
                                    {actionLoading === job.id ? (
                                      "..."
                                    ) : (
                                      <>
                                        <Trash2 className="h-4 w-4 mr-1" />
                                        Delete
                                      </>
                                    )}
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="font-libertinus">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle className="font-dm-serif font-normal text-xl">
                                      Delete Job
                                    </AlertDialogTitle>
                                    <AlertDialogDescription className="text-md">
                                      Are you sure you want to permanently
                                      delete "{job.title}"? This action cannot
                                      be undone and will remove all associated
                                      applications and data.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() =>
                                        handleDeleteJob(job.id, job.title)
                                      }
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Delete Job
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between space-x-2 py-4">
                      <div className="text-sm text-muted-foreground">
                        Page {currentPage} of {totalPages}
                      </div>
                      <div className="space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setCurrentPage(Math.max(1, currentPage - 1))
                          }
                          disabled={currentPage === 1}
                        >
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setCurrentPage(
                              Math.min(totalPages, currentPage + 1)
                            )
                          }
                          disabled={currentPage === totalPages}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}

                  {jobs.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No jobs found matching your criteria.
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
