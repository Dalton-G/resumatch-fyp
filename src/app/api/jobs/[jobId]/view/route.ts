import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET /api/jobs/[jobId]/view
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const session = await auth();
  const userRole = session?.user?.role || null;
  const { jobId } = await params;

  // Fetch job posting and increment view count atomically
  const job = await prisma.jobPosting.update({
    where: { id: jobId },
    data: { views: { increment: 1 } },
    include: {
      company: {
        include: {
          user: true,
        },
      },
    },
  });

  if (!job || !job.company) {
    return NextResponse.json(
      { error: "Job or company not found" },
      { status: 404 }
    );
  }

  // Count applications for this job
  const applicationCount = await prisma.jobApplication.count({
    where: { jobId },
  });

  return NextResponse.json({
    job: {
      id: job.id,
      title: job.title,
      description: job.description,
      location: job.location,
      salaryMin: job.salaryMin,
      salaryMax: job.salaryMax,
      status: job.status,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
      workType: job.workType,
      views: job.views + 1, // reflect incremented value
    },
    company: {
      id: job.company.id,
      name: job.company.name,
      description: job.company.description,
      website: job.company.website,
      industry: job.company.industry,
      size: job.company.size,
      address: job.company.address,
      profilePicture: job.company.profilePicture,
      views: job.company.views,
      email: job.company.user?.email || null,
      userId: job.company.user?.id || null,
    },
    applicationCount,
    userRole,
  });
}
