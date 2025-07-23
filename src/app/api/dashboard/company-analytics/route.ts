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

    if (session.user.role !== UserRole.COMPANY) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const timeRange = searchParams.get("timeRange") || "7"; // Default to 7 days

    // Calculate date range
    const now = new Date();
    const daysAgo = parseInt(timeRange);
    const startDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

    // Get company profile
    const company = await prisma.companyProfile.findUnique({
      where: { userId: session.user.id },
      select: {
        id: true,
        name: true,
        views: true,
      },
    });

    if (!company) {
      return NextResponse.json(
        { error: "Company profile not found" },
        { status: 404 }
      );
    }

    // Get all job postings for this company
    const allJobPostings = await prisma.jobPosting.findMany({
      where: { companyId: company.id },
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
        views: true,
        _count: {
          select: {
            applications: true,
          },
        },
        applications: {
          select: {
            id: true,
            status: true,
            appliedAt: true,
          },
        },
      },
    });

    // Calculate active job postings
    const activeJobPostings = allJobPostings.filter(
      (job) => job.status === "HIRING" || job.status === "URGENTLY_HIRING"
    ).length;

    // Get all applications across all company jobs
    const allApplications = allJobPostings.flatMap((job) => job.applications);
    const totalApplications = allApplications.length;

    // Get applications in time range
    const applicationsInRange = allApplications.filter(
      (app) => app.appliedAt >= startDate
    );

    // Get applications this month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const applicationsThisMonth = allApplications.filter(
      (app) => app.appliedAt >= startOfMonth
    ).length;

    // Application status breakdown (all time)
    const statusBreakdown = allApplications.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Job status distribution
    const jobStatusDistribution = allJobPostings.reduce((acc, job) => {
      acc[job.status] = (acc[job.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Applications by job posting (top 10)
    const applicationsByJob = allJobPostings
      .map((job) => ({
        jobId: job.id,
        jobTitle: job.title,
        applications: job._count.applications,
      }))
      .sort((a, b) => b.applications - a.applications)
      .slice(0, 10);

    // Top performing jobs (most applicants)
    const topPerformingJobs = allJobPostings
      .map((job) => ({
        jobId: job.id,
        jobTitle: job.title,
        applications: job._count.applications,
        views: job.views,
      }))
      .sort((a, b) => b.applications - a.applications)
      .slice(0, 5);

    // Application timeline data
    const timelineData: Array<{
      date: string;
      applications: number;
      dateFormatted: string;
    }> = [];
    const dateMap = new Map();

    // Initialize all days in range with 0
    for (let i = 0; i < daysAgo; i++) {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      const dateKey = date.toISOString().split("T")[0];
      dateMap.set(dateKey, 0);
    }

    // Count applications by day
    applicationsInRange.forEach((app) => {
      const dateKey = app.appliedAt.toISOString().split("T")[0];
      if (dateMap.has(dateKey)) {
        dateMap.set(dateKey, dateMap.get(dateKey) + 1);
      }
    });

    // Convert to array format for charts
    dateMap.forEach((count, date) => {
      timelineData.push({
        date,
        applications: count,
        dateFormatted: new Date(date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
      });
    });

    // Recent applications (last 5)
    const recentApplicationsData = await prisma.jobApplication.findMany({
      where: {
        job: {
          companyId: company.id,
        },
      },
      select: {
        id: true,
        status: true,
        appliedAt: true,
        job: {
          select: {
            title: true,
          },
        },
        jobSeeker: {
          select: {
            firstName: true,
            lastName: true,
            profession: true,
            profilePicture: true,
          },
        },
      },
      orderBy: {
        appliedAt: "desc",
      },
      take: 5,
    });

    // Calculate average time to fill
    const successfulApplications = allApplications.filter(
      (app) => app.status === "SUCCESS"
    );

    let averageTimeToFill = 0;
    if (successfulApplications.length > 0) {
      const jobsWithSuccess = await prisma.jobPosting.findMany({
        where: {
          id: {
            in: successfulApplications
              .map(
                (app) =>
                  allJobPostings.find((job) =>
                    job.applications.some((jobApp) => jobApp.id === app.id)
                  )?.id
              )
              .filter(Boolean) as string[],
          },
        },
        select: {
          id: true,
          createdAt: true,
          applications: {
            where: { status: "SUCCESS" },
            select: { appliedAt: true },
            orderBy: { appliedAt: "asc" },
            take: 1,
          },
        },
      });

      const timeToFillDays = jobsWithSuccess
        .filter((job) => job.applications.length > 0)
        .map((job) => {
          const jobCreated = job.createdAt;
          const firstSuccess = job.applications[0].appliedAt;
          return (
            (firstSuccess.getTime() - jobCreated.getTime()) /
            (1000 * 60 * 60 * 24)
          );
        });

      if (timeToFillDays.length > 0) {
        averageTimeToFill = Math.round(
          timeToFillDays.reduce((sum, days) => sum + days, 0) /
            timeToFillDays.length
        );
      }
    }

    // Format status breakdown for charts
    const statusChartData = Object.entries(statusBreakdown).map(
      ([status, count]) => ({
        status,
        name: status, // This will be used by the legend
        count,
        percentage: Math.round((count / totalApplications) * 100) || 0,
      })
    );

    // Format job status distribution
    const jobStatusChartData = Object.entries(jobStatusDistribution).map(
      ([status, count]) => ({
        status,
        name: status, // This will be used by the legend
        count,
        percentage: Math.round((count / allJobPostings.length) * 100) || 0,
      })
    );

    return NextResponse.json({
      analytics: {
        // Company info
        companyName: company.name,

        // Summary cards
        activeJobPostings,
        totalApplications,
        applicationsThisMonth,
        companyProfileViews: company.views,
        averageTimeToFill,

        // Chart data
        statusBreakdown: statusChartData,
        jobStatusDistribution: jobStatusChartData,
        applicationsByJob,
        topPerformingJobs,
        applicationTimeline: timelineData,

        // Recent activity
        recentApplications: recentApplicationsData.map((app) => ({
          id: app.id,
          candidateName: `${app.jobSeeker.firstName} ${app.jobSeeker.lastName}`,
          jobTitle: app.job.title,
          profession: app.jobSeeker.profession,
          profilePicture: app.jobSeeker.profilePicture,
          status: app.status,
          appliedAt: app.appliedAt,
        })),

        // Meta
        timeRange: daysAgo,
        dateRange: {
          from: startDate.toISOString(),
          to: now.toISOString(),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching company analytics:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
