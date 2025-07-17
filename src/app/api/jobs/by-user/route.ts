import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  // Authenticate user
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Find the company profile for the current user
  const companyProfile = await prisma.companyProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!companyProfile) {
    return NextResponse.json(
      { error: "Company profile not found for user." },
      { status: 404 }
    );
  }

  try {
    const jobPostings = await prisma.jobPosting.findMany({
      where: { companyId: companyProfile.id },
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
      },
    });
    // Optionally, you can map the result to flatten the count
    const postingsWithApplicantCount = jobPostings.map((job) => ({
      ...job,
      applicantCount: job._count.applications,
    }));
    return NextResponse.json(postingsWithApplicantCount, { status: 200 });
  } catch (error) {
    console.error("Error fetching job postings:", error);
    return NextResponse.json(
      { error: "Failed to fetch job postings" },
      { status: 500 }
    );
  }
}
