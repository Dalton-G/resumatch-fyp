import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const timeRange = searchParams.get("timeRange") || "30"; // Default to 30 days for admin

    // Calculate date range
    const now = new Date();
    const daysAgo = parseInt(timeRange);
    const startDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

    // Get admin profile (for consistency)
    const admin = await prisma.adminProfile.findUnique({
      where: { userId: session.user.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
      },
    });

    if (!admin) {
      return NextResponse.json(
        { error: "Admin profile not found" },
        { status: 404 }
      );
    }

    // 1. PLATFORM OVERVIEW METRICS

    // Total users by role
    const totalUsers = await prisma.user.count();
    const totalJobSeekers = await prisma.user.count({
      where: { role: UserRole.JOB_SEEKER },
    });
    const totalCompanies = await prisma.user.count({
      where: { role: UserRole.COMPANY },
    });
    const totalAdmins = await prisma.user.count({
      where: { role: UserRole.ADMIN },
    });

    // User growth in time range
    const newUsersInRange = await prisma.user.count({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
    });

    // Platform activity metrics
    const totalJobPostings = await prisma.jobPosting.count();
    const totalApplications = await prisma.jobApplication.count();
    const totalActiveJobs = await prisma.jobPosting.count({
      where: {
        status: {
          in: ["HIRING", "URGENTLY_HIRING"],
        },
      },
    });

    // 2. USER ANALYTICS

    // User role distribution
    const userRoleDistribution = [
      {
        role: "JOB_SEEKER",
        name: "Job Seekers",
        count: totalJobSeekers,
        percentage: Math.round((totalJobSeekers / totalUsers) * 100) || 0,
      },
      {
        role: "COMPANY",
        name: "Companies",
        count: totalCompanies,
        percentage: Math.round((totalCompanies / totalUsers) * 100) || 0,
      },
      {
        role: "ADMIN",
        name: "Admins",
        count: totalAdmins,
        percentage: Math.round((totalAdmins / totalUsers) * 100) || 0,
      },
    ];

    // User approval status
    const approvedUsers = await prisma.user.count({
      where: { isApproved: true },
    });
    const bannedUsers = await prisma.user.count({
      where: { isApproved: false },
    });

    const userApprovalStatus = [
      {
        status: "APPROVED",
        name: "Approved Users",
        count: approvedUsers,
        percentage: Math.round((approvedUsers / totalUsers) * 100) || 0,
      },
      {
        status: "BANNED",
        name: "Banned Users",
        count: bannedUsers,
        percentage: Math.round((bannedUsers / totalUsers) * 100) || 0,
      },
    ];

    // User growth timeline
    const userGrowthTimeline: Array<{
      date: string;
      users: number;
      dateFormatted: string;
    }> = [];
    const userDateMap = new Map();

    // Initialize all days in range with 0 (including today)
    for (let i = 0; i <= daysAgo; i++) {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      const dateKey = date.toISOString().split("T")[0];
      userDateMap.set(dateKey, 0);
    }

    // Get user registrations in time range
    const usersInRange = await prisma.user.findMany({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      select: {
        createdAt: true,
      },
    });

    // Count users by day
    usersInRange.forEach((user) => {
      const dateKey = user.createdAt.toISOString().split("T")[0];
      if (userDateMap.has(dateKey)) {
        userDateMap.set(dateKey, userDateMap.get(dateKey) + 1);
      }
    });

    // Convert to array format for charts
    userDateMap.forEach((count, date) => {
      userGrowthTimeline.push({
        date,
        users: count,
        dateFormatted: new Date(date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
      });
    });

    // 3. JOB MARKET ANALYTICS

    // Job status distribution (active vs closed)
    const closedJobs = await prisma.jobPosting.count({
      where: {
        status: {
          in: ["CLOSED", "CLOSED_BY_ADMIN"],
        },
      },
    });

    const jobStatusDistribution = [
      {
        status: "ACTIVE",
        name: "Active Jobs",
        count: totalActiveJobs,
        percentage: Math.round((totalActiveJobs / totalJobPostings) * 100) || 0,
      },
      {
        status: "CLOSED",
        name: "Closed Jobs",
        count: closedJobs,
        percentage: Math.round((closedJobs / totalJobPostings) * 100) || 0,
      },
    ];

    // Application flow timeline
    const applicationTimeline: Array<{
      date: string;
      applications: number;
      dateFormatted: string;
    }> = [];
    const appDateMap = new Map();

    // Initialize all days in range with 0 (including today)
    for (let i = 0; i <= daysAgo; i++) {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      const dateKey = date.toISOString().split("T")[0];
      appDateMap.set(dateKey, 0);
    }

    // Get applications in time range
    const applicationsInRange = await prisma.jobApplication.findMany({
      where: {
        appliedAt: {
          gte: startDate,
        },
      },
      select: {
        appliedAt: true,
      },
    });

    // Count applications by day
    applicationsInRange.forEach((app) => {
      const dateKey = app.appliedAt.toISOString().split("T")[0];
      if (appDateMap.has(dateKey)) {
        appDateMap.set(dateKey, appDateMap.get(dateKey) + 1);
      }
    });

    // Convert to array format for charts
    appDateMap.forEach((count, date) => {
      applicationTimeline.push({
        date,
        applications: count,
        dateFormatted: new Date(date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
      });
    });

    // Popular industries
    const industriesData = await prisma.companyProfile.groupBy({
      by: ["industry"],
      _count: {
        industry: true,
      },
      where: {
        industry: {
          not: null,
        },
      },
      orderBy: {
        _count: {
          industry: "desc",
        },
      },
      take: 10,
    });

    const popularIndustries = industriesData.map((industry) => ({
      industry: industry.industry || "Unknown",
      companies: industry._count.industry,
    }));

    // Geographic distribution
    const geographicData = await prisma.jobSeekerProfile.groupBy({
      by: ["country"],
      _count: {
        country: true,
      },
      where: {
        country: {
          not: null,
        },
      },
      orderBy: {
        _count: {
          country: "desc",
        },
      },
      take: 10,
    });

    const geographicDistribution = geographicData.map((geo) => ({
      country: geo.country || "Unknown",
      users: geo._count.country,
    }));

    // 4. DATA TABLES

    // Recent user registrations (last 10)
    const recentRegistrations = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isApproved: true,
        createdAt: true,
        jobSeekerProfile: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        companyProfile: {
          select: {
            name: true,
          },
        },
        adminProfile: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
    });

    // Top companies by performance (most applications received)
    const topCompanies = await prisma.companyProfile.findMany({
      select: {
        id: true,
        name: true,
        industry: true,
        _count: {
          select: {
            jobPostings: true,
          },
        },
        jobPostings: {
          select: {
            _count: {
              select: {
                applications: true,
              },
            },
          },
        },
      },
      take: 10,
    });

    const topCompaniesByPerformance = topCompanies
      .map((company) => ({
        companyId: company.id,
        companyName: company.name,
        industry: company.industry || "Unknown",
        jobPostings: company._count.jobPostings,
        totalApplications: company.jobPostings.reduce(
          (sum, job) => sum + job._count.applications,
          0
        ),
      }))
      .sort((a, b) => b.totalApplications - a.totalApplications)
      .slice(0, 10);

    // Trending skills
    const skillsData = await prisma.jobSeekerProfile.findMany({
      select: {
        skills: true,
      },
      where: {
        skills: {
          isEmpty: false,
        },
      },
    });

    const skillsMap = new Map();
    skillsData.forEach((profile) => {
      profile.skills.forEach((skill) => {
        const normalizedSkill = skill.trim().toLowerCase();
        skillsMap.set(
          normalizedSkill,
          (skillsMap.get(normalizedSkill) || 0) + 1
        );
      });
    });

    const trendingSkills = Array.from(skillsMap.entries())
      .map(([skill, count]) => ({
        skill: skill.charAt(0).toUpperCase() + skill.slice(1),
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);

    return NextResponse.json({
      analytics: {
        // Admin info
        adminName:
          `${admin.firstName || ""} ${admin.lastName || ""}`.trim() || "Admin",

        // Platform Overview (Summary Cards)
        totalUsers,
        newUsersInRange,
        totalApplications,
        geographicCount: geographicDistribution.length,

        // Chart data
        userRoleDistribution,
        userApprovalStatus,
        userGrowthTimeline,
        jobStatusDistribution,
        applicationTimeline,
        popularIndustries,
        geographicDistribution,

        // Data tables
        recentRegistrations: recentRegistrations.map((user) => ({
          id: user.id,
          name:
            user.name ||
            (user.jobSeekerProfile
              ? `${user.jobSeekerProfile.firstName || ""} ${
                  user.jobSeekerProfile.lastName || ""
                }`.trim()
              : user.companyProfile?.name ||
                (user.adminProfile
                  ? `${user.adminProfile.firstName || ""} ${
                      user.adminProfile.lastName || ""
                    }`.trim()
                  : "Unknown")),
          email: user.email,
          role: user.role,
          isApproved: user.isApproved,
          createdAt: user.createdAt,
        })),
        topCompaniesByPerformance,
        trendingSkills,

        // Meta
        timeRange: daysAgo,
        dateRange: {
          from: startDate.toISOString(),
          to: now.toISOString(),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching admin analytics:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
