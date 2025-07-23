"use client";

import { useState } from "react";
import { useJobSeekerAnalytics } from "@/hooks/use-job-seeker-analytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BarChart,
  Bar,
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
} from "recharts";
import {
  FiFileText,
  FiEye,
  FiUser,
  FiTrendingUp,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiPause,
} from "react-icons/fi";
import { MdWork } from "react-icons/md";
import { GiSkills } from "react-icons/gi";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";
import { pages } from "@/config/directory";

const timeRangeOptions = [
  { value: "7", label: "Last 7 days" },
  { value: "30", label: "Last 30 days" },
  { value: "180", label: "Last 6 months" },
];

const statusColors = {
  APPLIED: "#2b85ff", // --r-blue
  REVIEWING: "#f39c12", // orange
  INTERVIEWED: "#9b59b6", // purple
  OFFERED: "#27ae60", // green
  REJECTED: "#e74c3c", // red
  WITHDRAWN: "#95a5a6", // gray
};

const statusIcons = {
  APPLIED: FiClock,
  REVIEWING: FiAlertCircle,
  INTERVIEWED: FiUser,
  OFFERED: FiCheckCircle,
  REJECTED: FiXCircle,
  WITHDRAWN: FiPause,
};

interface JobSeekerDashboardContentProps {
  userId: string;
}

export default function JobSeekerDashboardContent({
  userId,
}: JobSeekerDashboardContentProps) {
  const [timeRange, setTimeRange] = useState("30");
  const { data, isLoading, error } = useJobSeekerAnalytics(timeRange);
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
            <div className="h-10 w-48 bg-gray-300 rounded animate-pulse"></div>
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
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
            {[...Array(4)].map((_, i) => (
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

  const handleChartClick = (data: any, section: string) => {
    if (section === "applications") {
      router.push(pages.myApplications);
    }
  };

  return (
    <div className="space-y-6 px-4 md:px-8 py-6 bg-[var(--r-gray)] min-h-[calc(100vh-8rem)] font-libertinus">
      {/* Header with Time Filter */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-dm-serif text-[var(--r-black)]">
            Your Dashboard
          </h2>
          <p className="text-[var(--r-boldgray)] mt-1">
            Track your job search progress and profile metrics
          </p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {timeRangeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <Card
          className="rounded-xl shadow-md hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => router.push(pages.myApplications)}
        >
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

        <Card
          className="rounded-xl shadow-md hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => router.push(`${pages.viewProfile}/${userId}`)}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--r-boldgray)]">
                  Profile Views
                </p>
                <p className="text-3xl font-dm-serif text-[var(--r-black)]">
                  {analytics.profileViews}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <FiEye className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className="rounded-xl shadow-md hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => router.push(pages.myResume)}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--r-boldgray)]">
                  Resumes
                </p>
                <p className="text-3xl font-dm-serif text-[var(--r-black)]">
                  {analytics.resumeCount}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <MdWork className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className="rounded-xl shadow-md hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => router.push(pages.editProfile)}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--r-boldgray)]">
                  Skills
                </p>
                <p className="text-3xl font-dm-serif text-[var(--r-black)]">
                  {analytics.skillsCount}
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <GiSkills className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
        {/* Profile Completion */}
        <Card className="rounded-xl shadow-md">
          <CardHeader>
            <CardTitle className="font-dm-serif text-xl text-[var(--r-black)]">
              Profile Completion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[var(--r-boldgray)]">
                  Your profile is {analytics.profileCompletionPercentage}%
                  complete
                </span>
                <span className="text-sm font-dm-serif text-[var(--r-black)]">
                  {analytics.profileCompletionPercentage}%
                </span>
              </div>
              <Progress
                value={analytics.profileCompletionPercentage}
                className="h-3"
              />
              <p className="text-xs text-[var(--r-boldgray)]">
                {analytics.profileCompletionPercentage < 100
                  ? "Complete your profile to increase visibility to employers"
                  : "Great! Your profile is fully complete"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Application Status Breakdown */}
        <Card className="rounded-xl shadow-md">
          <CardHeader>
            <CardTitle className="font-dm-serif text-xl text-[var(--r-black)]">
              Application Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.statusBreakdown.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.statusBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
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
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-[var(--r-boldgray)] space-y-3">
                <FiFileText className="h-12 w-12 text-[var(--r-blue)]" />
                <p className="text-center">No applications yet.</p>
                <p className="text-sm text-center">
                  Start applying to see your status breakdown!
                </p>
                <button
                  onClick={() => router.push(pages.jobPortal)}
                  className="px-4 py-2 bg-[var(--r-blue)] text-white rounded-lg text-sm hover:bg-[var(--r-blue)]/80 transition-colors"
                >
                  Find Jobs
                </button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
        {/* Application Timeline */}
        <Card className="rounded-xl shadow-md">
          <CardHeader>
            <CardTitle className="font-dm-serif text-xl text-[var(--r-black)]">
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
                      stroke="var(--r-blue)"
                      strokeWidth={3}
                      dot={{ fill: "var(--r-blue)", strokeWidth: 2, r: 4 }}
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

        {/* Recent Applications */}
        <Card className="rounded-xl shadow-md">
          <CardHeader>
            <CardTitle className="font-dm-serif text-xl text-[var(--r-black)]">
              Recent Applications
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.recentApplications.length > 0 ? (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {analytics.recentApplications.map((app) => {
                  const StatusIcon =
                    statusIcons[app.status as keyof typeof statusIcons] ||
                    FiClock;
                  return (
                    <div
                      key={app.id}
                      className="flex items-center justify-between p-3 bg-white rounded-lg border hover:shadow-sm transition-shadow cursor-pointer"
                      onClick={() =>
                        router.push(pages.viewMyApplication(app.id))
                      }
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className="p-2 rounded-full"
                          style={{
                            backgroundColor: `${
                              statusColors[
                                app.status as keyof typeof statusColors
                              ]
                            }20`,
                          }}
                        >
                          <StatusIcon
                            className="h-4 w-4"
                            style={{
                              color:
                                statusColors[
                                  app.status as keyof typeof statusColors
                                ],
                            }}
                          />
                        </div>
                        <div>
                          <p className="font-medium text-sm text-[var(--r-black)]">
                            {app.jobTitle}
                          </p>
                          <p className="text-xs text-[var(--r-boldgray)]">
                            {app.company}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant="outline"
                          className="text-xs"
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
                        <p className="text-xs text-[var(--r-boldgray)] mt-1">
                          {formatDistanceToNow(new Date(app.appliedAt), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-32 flex flex-col items-center justify-center text-[var(--r-boldgray)] space-y-3">
                <FiTrendingUp className="h-8 w-8 text-[var(--r-blue)]" />
                <p className="text-center">
                  No recent applications. Start your job search journey!
                </p>
                <button
                  onClick={() => router.push(pages.jobPortal)}
                  className="px-4 py-2 bg-[var(--r-blue)] text-white rounded-lg text-sm hover:bg-[var(--r-blue)]/80 transition-colors"
                >
                  Browse Jobs
                </button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
