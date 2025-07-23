"use client";

import { useState } from "react";
import { useCompanyAnalytics } from "@/hooks/use-company-analytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import {
  FiBriefcase,
  FiUsers,
  FiTrendingUp,
  FiEye,
  FiPlus,
  FiFileText,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiPause,
  FiAward,
} from "react-icons/fi";
import { MdWork } from "react-icons/md";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";
import { pages } from "@/config/directory";

const timeRangeOptions = [
  { value: "7", label: "Last 7 days" },
  { value: "30", label: "Last 30 days" },
  { value: "90", label: "Last 90 days" },
];

const statusColors = {
  APPLIED: "#3b82f6", // blue
  REVIEWING: "#f59e0b", // orange
  SHORTLISTED: "#8b5cf6", // purple
  REJECTED: "#ef4444", // red
  SUCCESS: "#10b981", // green
};

const jobStatusColors = {
  HIRING: "#10b981", // green
  URGENTLY_HIRING: "#f59e0b", // orange
  CLOSED: "#6b7280", // gray
  CLOSED_BY_ADMIN: "#ef4444", // red
};

const statusIcons = {
  APPLIED: FiClock,
  REVIEWING: FiAlertCircle,
  SHORTLISTED: FiUsers,
  REJECTED: FiXCircle,
  SUCCESS: FiCheckCircle,
};

interface CompanyDashboardContentProps {
  userId: string;
}

export default function CompanyDashboardContent({
  userId,
}: CompanyDashboardContentProps) {
  const [timeRange, setTimeRange] = useState("7");
  const { data, isLoading, error } = useCompanyAnalytics(timeRange);
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="px-4 md:px-8 py-6 bg-[var(--r-gray)] min-h-[calc(100vh-8rem)]">
        <div className="space-y-6">
          {/* Header Skeleton */}
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <div className="h-8 w-48 bg-gray-300 rounded animate-pulse"></div>
              <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="flex gap-4">
              <div className="h-10 w-48 bg-gray-300 rounded animate-pulse"></div>
              <div className="h-10 w-32 bg-gray-300 rounded animate-pulse"></div>
            </div>
          </div>

          {/* Cards Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-md">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-8 w-16 bg-gray-300 rounded animate-pulse"></div>
                  </div>
                  <div className="h-12 w-12 bg-gray-200 rounded-full animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>

          {/* Charts Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-md">
                <div className="h-6 w-32 bg-gray-300 rounded animate-pulse mb-4"></div>
                <div className="h-64 bg-gray-100 rounded animate-pulse"></div>
              </div>
            ))}
          </div>

          {/* Bottom Section Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-md">
                <div className="h-6 w-32 bg-gray-300 rounded animate-pulse mb-4"></div>
                <div className="h-64 bg-gray-100 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg font-libertinus text-red-500">
          Failed to load dashboard data. Please try refreshing the page.
        </div>
      </div>
    );
  }

  const analytics = data.analytics;

  const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  };

  const formatJobStatus = (status: string) => {
    switch (status) {
      case "HIRING":
        return "Hiring";
      case "URGENTLY_HIRING":
        return "Urgently Hiring";
      case "CLOSED":
        return "Closed";
      case "CLOSED_BY_ADMIN":
        return "Closed by Admin";
      default:
        return status;
    }
  };

  const handleChartClick = (data: any, section: string) => {
    if (section === "applications") {
      // Navigate to applications management
      router.push(pages.jobPortal); // Adjust based on your company routes
    } else if (section === "jobs") {
      router.push(pages.createJob);
    }
  };

  return (
    <div className="space-y-6 px-4 md:px-8 py-6 bg-[var(--r-gray)] min-h-[calc(100vh-8rem)] max-h-[calc(100vh-6.5rem)] overflow-y-auto font-libertinus">
      {/* Header with Time Filter and Quick Action */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-dm-serif text-[var(--r-black)]">
            Welcome Back, {analytics.companyName}
          </h2>
          <p className="text-[var(--r-boldgray)] mt-1">
            Manage your hiring process and track recruitment metrics
          </p>
        </div>
        <div className="flex gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-48 bg-white">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              {timeRangeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={() => router.push(pages.createJob)}
            className="bg-[var(--r-blue)] hover:bg-[var(--r-blue)]/80 text-white px-4 py-2 gap-2"
          >
            <FiPlus className="h-4 w-4" />
            Post New Job
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <Card
          className="rounded-xl shadow-md hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => router.push(pages.myJobPostings)}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--r-boldgray)]">
                  Active Job Postings
                </p>
                <p className="text-3xl font-dm-serif text-[var(--r-black)]">
                  {analytics.activeJobPostings}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <FiBriefcase className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--r-boldgray)]">
                  Total Applications
                </p>
                <p className="text-3xl font-dm-serif text-[var(--r-black)]">
                  {analytics.totalApplications}
                </p>
              </div>
              <div className="p-3 bg-[var(--r-blue)]/10 rounded-full">
                <FiFileText className="h-6 w-6 text-[var(--r-blue)]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--r-boldgray)]">
                  Applications This Month
                </p>
                <p className="text-3xl font-dm-serif text-[var(--r-black)]">
                  {analytics.applicationsThisMonth}
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <FiTrendingUp className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className="rounded-xl shadow-md hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => router.push(`${pages.viewProfile}/${userId}`)}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--r-boldgray)]">
                  Company Profile Views
                </p>
                <p className="text-3xl font-dm-serif text-[var(--r-black)]">
                  {analytics.companyProfileViews}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <FiEye className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section - Row 2: Application Status & Applications by Job */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Application Status Breakdown */}
        <Card className="rounded-xl shadow-md">
          <CardHeader>
            <CardTitle className="font-dm-serif font-normal text-xl text-[var(--r-black)]">
              Application Status Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.statusBreakdown.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.statusBreakdown}
                      cx="50%"
                      cy="45%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="count"
                      onClick={() => handleChartClick(null, "applications")}
                      className="cursor-pointer"
                    >
                      {analytics.statusBreakdown.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            statusColors[
                              entry.status as keyof typeof statusColors
                            ] || "#cdcdcd"
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: any, name: any, props: any) => [
                        `${value} (${props.payload.percentage}%)`,
                        formatStatus(props.payload.status),
                      ]}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      formatter={(value, entry) => (
                        <span style={{ color: entry.color, fontSize: "12px" }}>
                          {formatStatus(value)}
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-[var(--r-boldgray)] space-y-3">
                <FiUsers className="h-12 w-12 text-[var(--r-blue)]" />
                <p className="text-center">No applications received yet.</p>
                <p className="text-sm text-center">
                  Start posting jobs to attract candidates!
                </p>
                <button
                  onClick={() => router.push(pages.createJob)}
                  className="px-4 py-2 bg-[var(--r-blue)] text-white rounded-lg text-sm hover:bg-[var(--r-blue)]/80 transition-colors"
                >
                  Post Your First Job
                </button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Applications by Job Posting */}
        <Card className="rounded-xl shadow-md">
          <CardHeader>
            <CardTitle className="font-dm-serif font-normal text-xl text-[var(--r-black)]">
              Applications by Job Posting
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.applicationsByJob.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={analytics.applicationsByJob.slice(0, 6)}
                    layout="vertical"
                    margin={{ left: 100, right: 20, top: 5, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis
                      type="number"
                      tick={{ fontSize: 12 }}
                      stroke="#727272"
                      domain={[0, "dataMax + 1"]}
                    />
                    <YAxis
                      type="category"
                      dataKey="jobTitle"
                      tick={{ fontSize: 10 }}
                      stroke="#727272"
                      width={90}
                      tickFormatter={(value) =>
                        value.length > 15
                          ? value.substring(0, 15) + "..."
                          : value
                      }
                    />
                    <Tooltip
                      formatter={(value) => [`${value}`, "Applications"]}
                      labelFormatter={(label) => `Job: ${label}`}
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #cdcdcd",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar
                      dataKey="applications"
                      fill="var(--r-blue)"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-[var(--r-boldgray)]">
                No job postings with applications yet.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Section - Row 3: Timeline & Job Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Application Timeline */}
        <Card className="rounded-xl shadow-md">
          <CardHeader>
            <CardTitle className="font-dm-serif font-normal text-xl text-[var(--r-black)]">
              Application Timeline (
              {timeRangeOptions.find((opt) => opt.value === timeRange)?.label})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.applicationTimeline.some(
              (item) => item.applications > 0
            ) ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics.applicationTimeline}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis
                      dataKey="dateFormatted"
                      tick={{ fontSize: 12 }}
                      stroke="#727272"
                    />
                    <YAxis tick={{ fontSize: 12 }} stroke="#727272" />
                    <Tooltip
                      labelFormatter={(label) => `Date: ${label}`}
                      formatter={(value) => [`${value}`, "Applications"]}
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #cdcdcd",
                        borderRadius: "8px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="applications"
                      stroke="#10b981"
                      strokeWidth={3}
                      dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-[var(--r-boldgray)]">
                No applications in the selected time range.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Job Status Distribution */}
        <Card className="rounded-xl shadow-md">
          <CardHeader>
            <CardTitle className="font-dm-serif font-normal text-xl text-[var(--r-black)]">
              Job Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.jobStatusDistribution.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.jobStatusDistribution}
                      cx="50%"
                      cy="45%"
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="count"
                      onClick={() => handleChartClick(null, "jobs")}
                      className="cursor-pointer"
                    >
                      {analytics.jobStatusDistribution.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            jobStatusColors[
                              entry.status as keyof typeof jobStatusColors
                            ] || "#cdcdcd"
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: any, name: any, props: any) => [
                        `${value} (${props.payload.percentage}%)`,
                        formatJobStatus(props.payload.status),
                      ]}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      formatter={(value, entry) => (
                        <span style={{ color: entry.color, fontSize: "12px" }}>
                          {formatJobStatus(value)}
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-[var(--r-boldgray)]">
                No job postings found.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section - Row 4: Top Jobs, Recent Applications & Trending Skills */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Top Performing Jobs */}
        <Card className="rounded-xl shadow-md">
          <CardHeader>
            <CardTitle className="font-dm-serif font-normal text-xl text-[var(--r-black)]">
              Top Performing Jobs
              {analytics.averageTimeToFill > 0 && (
                <span className="text-sm font-normal text-[var(--r-boldgray)] block">
                  Avg. Time to Fill: {analytics.averageTimeToFill} days
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.topPerformingJobs.length > 0 ? (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {analytics.topPerformingJobs.map((job, index) => (
                  <div
                    key={job.jobId}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => router.push(pages.viewJob(job.jobId))}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-[var(--r-blue)] text-white rounded-full text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-[var(--r-black)] text-sm">
                          {job.jobTitle.length > 40
                            ? job.jobTitle.substring(0, 40) + "..."
                            : job.jobTitle}
                        </p>
                        <p className="text-xs text-[var(--r-boldgray)]">
                          {job.views} views
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant="secondary"
                        className="bg-[var(--r-blue)]/10 text-[var(--r-blue)]"
                      >
                        {job.applications} applicants
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-[var(--r-boldgray)] space-y-3">
                <MdWork className="h-12 w-12 text-[var(--r-blue)]" />
                <p className="text-center">No job performance data yet.</p>
                <button
                  onClick={() => router.push(pages.createJob)}
                  className="px-4 py-2 bg-[var(--r-blue)] text-white rounded-lg text-sm hover:bg-[var(--r-blue)]/80 transition-colors"
                >
                  Create Job Posting
                </button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Applications */}
        <Card className="rounded-xl shadow-md">
          <CardHeader>
            <CardTitle className="font-dm-serif font-normal text-xl text-[var(--r-black)]">
              Recent Applications
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.recentApplications.length > 0 ? (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {analytics.recentApplications.map((app) => (
                  <div
                    key={app.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-[var(--r-darkgray)] flex items-center justify-center overflow-hidden">
                        {app.profilePicture ? (
                          <img
                            src={app.profilePicture}
                            alt={app.candidateName}
                            className="w-full h-full object-cover rounded-full"
                          />
                        ) : (
                          <span className="font-bold text-sm text-[var(--r-blue)]">
                            {app.candidateName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-[var(--r-black)] text-sm">
                          {app.candidateName}
                        </p>
                        <p className="text-xs text-[var(--r-boldgray)]">
                          {app.jobTitle}
                        </p>
                        <p className="text-xs text-[var(--r-boldgray)]">
                          {app.profession || "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant="outline"
                        className="text-xs mb-1"
                        style={{
                          borderColor:
                            statusColors[
                              app.status as keyof typeof statusColors
                            ],
                          color:
                            statusColors[
                              app.status as keyof typeof statusColors
                            ],
                        }}
                      >
                        {formatStatus(app.status)}
                      </Badge>
                      <p className="text-xs text-[var(--r-boldgray)]">
                        {formatDistanceToNow(new Date(app.appliedAt), {
                          addSuffix: true,
                        })}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-1 h-6 text-xs"
                        onClick={() =>
                          router.push(pages.viewApplication(app.id))
                        }
                      >
                        View Application
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-[var(--r-boldgray)] space-y-3">
                <FiUsers className="h-8 w-8 text-[var(--r-blue)]" />
                <p className="text-center">
                  No recent applications. Start attracting candidates!
                </p>
                <button
                  onClick={() => router.push(pages.createJob)}
                  className="px-4 py-2 bg-[var(--r-blue)] text-white rounded-lg text-sm hover:bg-[var(--r-blue)]/80 transition-colors"
                >
                  Post a Job
                </button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Trending Skills */}
        <Card className="rounded-xl shadow-md">
          <CardHeader>
            <CardTitle className="font-dm-serif font-normal text-xl text-[var(--r-black)]">
              Trending Skills
              <span className="text-sm font-normal text-[var(--r-boldgray)] block">
                Among your applicants
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.trendingSkills && analytics.trendingSkills.length > 0 ? (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {analytics.trendingSkills.map((skill, index) => (
                  <div
                    key={skill.skill}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-purple-100 text-purple-600 rounded-full text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-[var(--r-black)] text-sm">
                          {skill.skill}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant="secondary"
                        className="bg-purple-100 text-purple-600"
                      >
                        {skill.count} applicants
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-[var(--r-boldgray)] space-y-3">
                <FiAward className="h-12 w-12 text-purple-600" />
                <p className="text-center">No trending skills data yet.</p>
                <p className="text-sm text-center">
                  Skills will appear as candidates apply to your jobs!
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
