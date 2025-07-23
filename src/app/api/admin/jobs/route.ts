import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { JobStatus, WorkType } from "@prisma/client";

interface AdminJobsResponse {
  jobs: AdminJobPosting[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
}

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

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const statusFilter = searchParams.get("status") || "all";
    const workTypeFilter = searchParams.get("workType") || "all";

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    // Search filter
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { company: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    // Status filter
    if (statusFilter !== "all") {
      where.status = statusFilter as JobStatus;
    }

    // Work type filter
    if (workTypeFilter !== "all") {
      where.workType = workTypeFilter as WorkType;
    }

    // Get total count for pagination
    const totalCount = await prisma.jobPosting.count({ where });

    // Fetch job postings with all data
    const jobPostings = await prisma.jobPosting.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      select: {
        id: true,
        title: true,
        status: true,
        workType: true,
        country: true,
        views: true,
        createdAt: true,
        _count: {
          select: { applications: true },
        },
        company: {
          select: {
            id: true,
            name: true,
            profilePicture: true,
          },
        },
      },
    });

    // Format response data
    const jobs: AdminJobPosting[] = jobPostings.map((job) => ({
      id: job.id,
      title: job.title,
      status: job.status,
      workType: job.workType,
      country: job.country,
      applicantCount: job._count.applications,
      views: job.views,
      createdAt: job.createdAt.toISOString(),
      company: {
        id: job.company.id,
        name: job.company.name,
        profilePicture: job.company.profilePicture,
      },
    }));

    const totalPages = Math.ceil(totalCount / limit);

    const response: AdminJobsResponse = {
      jobs,
      totalCount,
      currentPage: page,
      totalPages,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error fetching admin jobs:", error);
    return NextResponse.json(
      { error: "Failed to fetch jobs" },
      { status: 500 }
    );
  }
}
