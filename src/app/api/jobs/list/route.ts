import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const jobPostings = await prisma.jobPosting.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        description: true,
        location: true,
        salaryMin: true,
        salaryMax: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        companyId: true,
        workType: true,
        views: true,
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
    // Flatten applicant count
    const postings = jobPostings.map((job) => ({
      ...job,
      applicantCount: job._count.applications,
      _count: undefined,
    }));
    return NextResponse.json(postings, { status: 200 });
  } catch (error) {
    console.error("Error fetching job postings:", error);
    return NextResponse.json(
      { error: "Failed to fetch job postings" },
      { status: 500 }
    );
  }
}
