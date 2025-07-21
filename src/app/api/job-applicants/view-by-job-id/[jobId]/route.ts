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

    const applications = await prisma.jobApplication.findMany({
      where: { jobId },
      include: {
        jobSeeker: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profession: true,
            profilePicture: true,
            userId: true,
          },
        },
        resume: {
          select: {
            id: true,
            fileName: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        applications,
        length: applications.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching job application:", error);
    return NextResponse.json(
      { error: "Failed to fetch job application" },
      { status: 500 }
    );
  }
}
