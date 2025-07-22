import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== UserRole.COMPANY) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get the company profile to get the actual company ID
    const companyProfile = await prisma.companyProfile.findUnique({
      where: {
        userId: session.user.id,
      },
      select: {
        id: true,
      },
    });

    if (!companyProfile) {
      return NextResponse.json(
        { error: "Company profile not found" },
        { status: 404 }
      );
    }

    // Get company's job postings with applicant counts
    const jobsWithApplicants = await prisma.jobPosting.findMany({
      where: {
        companyId: companyProfile.id,
        status: {
          in: ["HIRING", "URGENTLY_HIRING"], // Only active jobs
        },
      },
      select: {
        id: true,
        title: true,
        _count: {
          select: {
            applications: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Filter out jobs with no applicants and format the response
    const jobsWithApplicantsFiltered = jobsWithApplicants
      .filter((job) => job._count.applications > 0)
      .map((job) => ({
        id: job.id,
        title: job.title,
        applicantCount: job._count.applications,
      }));

    return NextResponse.json(jobsWithApplicantsFiltered);
  } catch (error) {
    console.error("Error fetching jobs with applicants:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
