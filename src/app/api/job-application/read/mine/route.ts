import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // 1. Check Auth
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Fetch Job Seeker Id
    const jobSeeker = await prisma.jobSeekerProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!jobSeeker) {
      return NextResponse.json(
        { error: "Job Seeker not found" },
        { status: 404 }
      );
    }

    // 3. Fetch Applications
    const applications = await prisma.jobApplication.findMany({
      where: { jobSeekerId: jobSeeker.id },
    });

    return NextResponse.json({ applications }, { status: 200 });
  } catch (error) {
    console.error("Error fetching job applications:", error);
    return NextResponse.json(
      { error: "Failed to fetch job applications." },
      { status: 500 }
    );
  }
}
