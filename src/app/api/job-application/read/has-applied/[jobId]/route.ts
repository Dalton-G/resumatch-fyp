import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { jobId } = await params;

    const jobSeeker = await prisma.jobSeekerProfile.findUnique({
      where: { userId: session.user.id },
      select: {
        id: true,
      },
    });

    if (!jobSeeker) {
      return NextResponse.json(
        { error: "Job seeker profile not found" },
        { status: 404 }
      );
    }

    const hasApplied = await prisma.jobApplication.findFirst({
      where: {
        jobId: jobId,
        jobSeekerId: jobSeeker.id,
      },
    });

    return NextResponse.json(
      {
        hasApplied: !!hasApplied,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching job application status:", error);
    return NextResponse.json(
      { error: "Failed to fetch job application status" },
      { status: 500 }
    );
  }
}
