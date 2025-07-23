import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { ApplicationStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const timeRange = searchParams.get("timeRange") || "30"; // Default to 30 days

    // Calculate date range
    const now = new Date();
    const daysAgo = parseInt(timeRange);
    const startDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

    // Get job seeker profile
    const jobSeeker = await prisma.jobSeekerProfile.findUnique({
      where: { userId: session.user.id },
      select: {
        id: true,
        views: true,
        skills: true,
        firstName: true,
        lastName: true,
        phone: true,
        country: true,
        bio: true,
        linkedinUrl: true,
        githubUrl: true,
        portfolioUrl: true,
        profilePicture: true,
        profession: true,
      },
    });

    if (!jobSeeker) {
      return NextResponse.json(
        { error: "Job seeker profile not found" },
        { status: 404 }
      );
    }

    // Get all applications for total count
    const totalApplications = await prisma.jobApplication.count({
      where: { jobSeekerId: jobSeeker.id },
    });

    // Get applications within time range for trend analysis
    const applicationsInRange = await prisma.jobApplication.findMany({
      where: {
        jobSeekerId: jobSeeker.id,
        appliedAt: {
          gte: startDate,
        },
      },
      select: {
        id: true,
        status: true,
        appliedAt: true,
        job: {
          select: {
            title: true,
            company: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        appliedAt: "desc",
      },
    });

    // Get application status breakdown (all time)
    const statusBreakdown = await prisma.jobApplication.groupBy({
      by: ["status"],
      where: { jobSeekerId: jobSeeker.id },
      _count: {
        status: true,
      },
    });

    // Get resume count
    const resumeCount = await prisma.resume.count({
      where: { jobSeekerId: jobSeeker.id },
    });

    // Calculate profile completion percentage
    const profileFields = [
      jobSeeker.firstName,
      jobSeeker.lastName,
      jobSeeker.phone,
      jobSeeker.country,
      jobSeeker.bio,
      jobSeeker.profession,
      jobSeeker.profilePicture,
      jobSeeker.linkedinUrl || jobSeeker.githubUrl || jobSeeker.portfolioUrl, // At least one social link
      jobSeeker.skills && jobSeeker.skills.length > 0 ? "skills" : null, // Has skills
    ];

    const completedFields = profileFields.filter(
      (field) => field !== null && field !== undefined && field !== ""
    ).length;
    const profileCompletionPercentage = Math.round(
      (completedFields / profileFields.length) * 100
    );

    // Prepare timeline data (group by day)
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
    const recentApplications = applicationsInRange.slice(0, 5).map((app) => ({
      id: app.id,
      jobTitle: app.job.title,
      company: app.job.company.name,
      status: app.status,
      appliedAt: app.appliedAt,
    }));

    // Format status breakdown for charts
    const statusChartData = statusBreakdown.map((item) => ({
      status: item.status,
      count: item._count.status,
      percentage:
        Math.round((item._count.status / totalApplications) * 100) || 0,
    }));

    return NextResponse.json({
      analytics: {
        // Summary cards
        totalApplications,
        profileViews: jobSeeker.views,
        resumeCount,
        skillsCount: jobSeeker.skills.length,
        profileCompletionPercentage,

        // Chart data
        statusBreakdown: statusChartData,
        applicationTimeline: timelineData,

        // Recent activity
        recentApplications,

        // Meta
        timeRange: daysAgo,
        dateRange: {
          from: startDate.toISOString(),
          to: now.toISOString(),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching job seeker analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics data" },
      { status: 500 }
    );
  }
}
