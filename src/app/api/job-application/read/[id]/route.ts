import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;

    const application = await prisma.jobApplication.findUnique({
      where: { id },
      include: {
        jobSeeker: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profession: true,
            profilePicture: true,
          },
        },
        job: {
          select: {
            id: true,
            title: true,
            description: true,
            status: true,
            country: true,
            salaryMin: true,
            salaryMax: true,
            workType: true,
            company: {
              select: {
                id: true,
                name: true,
                profilePicture: true,
              },
            },
          },
        },
        resume: {
          select: {
            id: true,
            fileName: true,
            s3Url: true,
          },
        },
      },
    });
    if (!application) {
      return NextResponse.json(
        { error: "Job application not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        application,
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
