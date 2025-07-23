"use client";

import { useState } from "react";
import { useAdminAnalytics } from "@/hooks/use-admin-analytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
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
  FiUsers,
  FiTrendingUp,
  FiActivity,
  FiGlobe,
  FiShield,
  FiBriefcase,
  FiCheckCircle,
  FiXCircle,
  FiEye,
  FiAward,
} from "react-icons/fi";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";

const timeRangeOptions = [
  { value: "7", label: "Last 7 days" },
  { value: "30", label: "Last 30 days" },
  { value: "90", label: "Last 90 days" },
];

const roleColors = {
  JOB_SEEKER: "#3b82f6", // blue
  COMPANY: "#10b981", // green
  ADMIN: "#8b5cf6", // purple
};

const approvalColors = {
  APPROVED: "#10b981", // green
  BANNED: "#ef4444", // red
};

const jobStatusColors = {
  ACTIVE: "#10b981", // green
  CLOSED: "#6b7280", // gray
};

interface AdminDashboardContentProps {
  userId: string;
}

export default function AdminDashboardContent({
  userId,
}: AdminDashboardContentProps) {
  const [timeRange, setTimeRange] = useState("30");
  const { data, isLoading, error } = useAdminAnalytics(timeRange);
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            {[...Array(6)].map((_, i) => (
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
          Failed to load admin dashboard data. Please try refreshing the page.
        </div>
      </div>
    );
  }

  const analytics = data.analytics;

  const formatRole = (role: string) => {
    switch (role) {
      case "JOB_SEEKER":
        return "Job Seeker";
      case "COMPANY":
        return "Company";
      case "ADMIN":
        return "Admin";
      default:
        return role;
    }
  };

  const formatApprovalStatus = (isApproved: boolean) => {
    return isApproved ? "Approved" : "Banned";
  };

  return (
    <div className="space-y-6 px-4 md:px-8 py-6 bg-[var(--r-gray)] min-h-[calc(100vh-8rem)] font-libertinus">
      {/* Header with Time Filter */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-dm-serif text-[var(--r-black)]">
            Admin Dashboard - {analytics.adminName}
          </h2>
          <p className="text-[var(--r-boldgray)] mt-1">
            Monitor platform metrics and oversee system performance
          </p>
        </div>
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
      </div>

      {/* Summary Cards - Row 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <Card className="rounded-xl shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--r-boldgray)]">
                  Total Users
                </p>
                <p className="text-3xl font-dm-serif text-[var(--r-black)]">
                  {analytics.totalUsers}
                </p>
              </div>
              <div className="p-3 bg-[var(--r-blue)]/10 rounded-full">
                <FiUsers className="h-6 w-6 text-[var(--r-blue)]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--r-boldgray)]">
                  New Users (
                  {
                    timeRangeOptions.find((opt) => opt.value === timeRange)
                      ?.label
                  }
                  )
                </p>
                <p className="text-3xl font-dm-serif text-[var(--r-black)]">
                  {analytics.newUsersInRange}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <FiTrendingUp className="h-6 w-6 text-green-600" />
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
              <div className="p-3 bg-purple-100 rounded-full">
                <FiActivity className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--r-boldgray)]">
                  Countries
                </p>
                <p className="text-3xl font-dm-serif text-[var(--r-black)]">
                  {analytics.geographicCount}
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <FiGlobe className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section - Row 2: User Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* User Role Distribution */}
        <Card className="rounded-xl shadow-md">
          <CardHeader>
            <CardTitle className="font-dm-serif font-normal text-xl text-[var(--r-black)]">
              User Role Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.userRoleDistribution.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.userRoleDistribution}
                      cx="50%"
                      cy="45%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="count"
                      className="cursor-pointer"
                    >
                      {analytics.userRoleDistribution.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            roleColors[entry.role as keyof typeof roleColors] ||
                            "#cdcdcd"
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: any, name: any, props: any) => [
                        `${value} (${props.payload.percentage}%)`,
                        formatRole(props.payload.role),
                      ]}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      formatter={(value, entry) => (
                        <span style={{ color: entry.color, fontSize: "12px" }}>
                          {formatRole(value)}
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-[var(--r-boldgray)]">
                No user data available.
              </div>
            )}
          </CardContent>
        </Card>

        {/* User Approval Status */}
        <Card className="rounded-xl shadow-md">
          <CardHeader>
            <CardTitle className="font-dm-serif font-normal text-xl text-[var(--r-black)]">
              User Approval Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.userApprovalStatus.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.userApprovalStatus}
                      cx="50%"
                      cy="45%"
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="count"
                      className="cursor-pointer"
                    >
                      {analytics.userApprovalStatus.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            approvalColors[
                              entry.status as keyof typeof approvalColors
                            ] || "#cdcdcd"
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: any, name: any, props: any) => [
                        `${value} (${props.payload.percentage}%)`,
                        props.payload.name,
                      ]}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      formatter={(value, entry: any) => (
                        <span style={{ color: entry.color, fontSize: "12px" }}>
                          {entry.payload?.name || value}
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-[var(--r-boldgray)]">
                No approval data available.
              </div>
            )}
          </CardContent>
        </Card>

        {/* User Growth Timeline */}
        <Card className="rounded-xl shadow-md">
          <CardHeader>
            <CardTitle className="font-dm-serif font-normal text-xl text-[var(--r-black)]">
              User Growth (
              {timeRangeOptions.find((opt) => opt.value === timeRange)?.label})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.userGrowthTimeline.some((item) => item.users > 0) ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics.userGrowthTimeline}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis
                      dataKey="dateFormatted"
                      tick={{ fontSize: 12 }}
                      stroke="#727272"
                    />
                    <YAxis tick={{ fontSize: 12 }} stroke="#727272" />
                    <Tooltip
                      labelFormatter={(label) => `Date: ${label}`}
                      formatter={(value) => [`${value}`, "New Users"]}
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #cdcdcd",
                        borderRadius: "8px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="users"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-[var(--r-boldgray)]">
                No new user registrations in the selected time range.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Section - Row 3: Job Market Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
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
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="count"
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
                        props.payload.name,
                      ]}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      formatter={(value, entry: any) => (
                        <span style={{ color: entry.color, fontSize: "12px" }}>
                          {entry.payload?.name || value}
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-[var(--r-boldgray)]">
                No job data available.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Application Timeline */}
        <Card className="rounded-xl shadow-md">
          <CardHeader>
            <CardTitle className="font-dm-serif font-normal text-xl text-[var(--r-black)]">
              Application Flow (
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

        {/* Geographic Distribution */}
        <Card className="rounded-xl shadow-md">
          <CardHeader>
            <CardTitle className="font-dm-serif font-normal text-xl text-[var(--r-black)]">
              Geographic Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.geographicDistribution.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={analytics.geographicDistribution.slice(0, 8)}
                    margin={{ left: 20, right: 20, top: 5, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis
                      dataKey="country"
                      tick={{ fontSize: 10 }}
                      stroke="#727272"
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis tick={{ fontSize: 12 }} stroke="#727272" />
                    <Tooltip
                      formatter={(value) => [`${value}`, "Users"]}
                      labelFormatter={(label) => `Country: ${label}`}
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #cdcdcd",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="users" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-[var(--r-boldgray)]">
                No geographic data available.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Data Tables Section - Row 4 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Popular Industries */}
        <Card className="rounded-xl shadow-md">
          <CardHeader>
            <CardTitle className="font-dm-serif font-normal text-xl text-[var(--r-black)]">
              Popular Industries
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.popularIndustries.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={analytics.popularIndustries.slice(0, 6)}
                    layout="vertical"
                    margin={{ left: 100, right: 20, top: 5, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis
                      type="number"
                      tick={{ fontSize: 12 }}
                      stroke="#727272"
                    />
                    <YAxis
                      type="category"
                      dataKey="industry"
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
                      formatter={(value) => [`${value}`, "Companies"]}
                      labelFormatter={(label) => `Industry: ${label}`}
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #cdcdcd",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar
                      dataKey="companies"
                      fill="#8b5cf6"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-[var(--r-boldgray)]">
                No industry data available.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent User Registrations */}
        <Card className="rounded-xl shadow-md">
          <CardHeader>
            <CardTitle className="font-dm-serif font-normal text-xl text-[var(--r-black)]">
              Recent User Registrations
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.recentRegistrations.length > 0 ? (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {analytics.recentRegistrations.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-[var(--r-blue)]/10 rounded-full">
                        {user.isApproved ? (
                          <FiCheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <FiXCircle className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm text-[var(--r-black)]">
                          {user.name || "Unknown User"}
                        </p>
                        <p className="text-xs text-[var(--r-boldgray)]">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant="outline"
                        className="text-xs mb-1"
                        style={{
                          borderColor:
                            roleColors[user.role as keyof typeof roleColors],
                          color:
                            roleColors[user.role as keyof typeof roleColors],
                        }}
                      >
                        {formatRole(user.role)}
                      </Badge>
                      <p className="text-xs text-[var(--r-boldgray)]">
                        {formatDistanceToNow(new Date(user.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-[var(--r-boldgray)] space-y-3">
                <FiUsers className="h-12 w-12 text-[var(--r-blue)]" />
                <p className="text-center">No recent registrations found.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section - Row 5: Top Companies & Trending Skills */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Top Companies by Performance */}
        <Card className="rounded-xl shadow-md">
          <CardHeader>
            <CardTitle className="font-dm-serif font-normal text-xl text-[var(--r-black)]">
              Top Companies by Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.topCompaniesByPerformance.length > 0 ? (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {analytics.topCompaniesByPerformance.map((company, index) => (
                  <div
                    key={company.companyId}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-[var(--r-blue)] text-white rounded-full text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-[var(--r-black)] text-sm">
                          {company.companyName.length > 30
                            ? company.companyName.substring(0, 30) + "..."
                            : company.companyName}
                        </p>
                        <p className="text-xs text-[var(--r-boldgray)]">
                          {company.industry} • {company.jobPostings} jobs
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant="secondary"
                        className="bg-[var(--r-blue)]/10 text-[var(--r-blue)]"
                      >
                        {company.totalApplications} applications
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-[var(--r-boldgray)] space-y-3">
                <FiBriefcase className="h-12 w-12 text-[var(--r-blue)]" />
                <p className="text-center">No company performance data yet.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Trending Skills */}
        <Card className="rounded-xl shadow-md">
          <CardHeader>
            <CardTitle className="font-dm-serif font-normal text-xl text-[var(--r-black)]">
              Trending Skills
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.trendingSkills.length > 0 ? (
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
                        {skill.count} users
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-[var(--r-boldgray)] space-y-3">
                <FiAward className="h-12 w-12 text-purple-600" />
                <p className="text-center">No trending skills data yet.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
