import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateResumeAppliedJobs } from "@/lib/utils/pinecone-operation";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "JOB_SEEKER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { jobId, resumeId, coverLetter, jobSeekerId } = body;

    if (!jobId || !resumeId || !jobSeekerId) {
      return NextResponse.json(
        { error: "Missing required fields: jobId, resumeId, jobSeekerId" },
        { status: 400 }
      );
    }

    // 1. Get the profile of the submitter
    const jobSeeker = await prisma.jobSeekerProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!jobSeeker) {
      return NextResponse.json(
        { error: "Job Seeker profile not found." },
        { status: 404 }
      );
    }

    // 2. check if jobSeekerId must match session user
    if (jobSeekerId !== jobSeeker.id) {
      return NextResponse.json(
        { error: "Forbidden: jobSeekerId mismatch" },
        { status: 403 }
      );
    }

    // 3. Duplication check
    const existing = await prisma.jobApplication.findFirst({
      where: { jobId, jobSeekerId },
    });
    if (existing) {
      return NextResponse.json(
        { error: "You have already applied for this job." },
        { status: 409 }
      );
    }

    // 4. Create application
    const application = await prisma.jobApplication.create({
      data: {
        jobId,
        resumeId,
        coverLetter,
        jobSeekerId,
      },
    });

    // 5. Add the job id into the job seeker resume's appliedJobIds array
    await updateResumeAppliedJobs(resumeId, jobId);

    // 6. Save into Supabase
    await prisma.resumeEmbedding.update({
      where: { resumeId },
      data: {
        appliedJobIds: {
          push: jobId,
        },
      },
    });

    return NextResponse.json({ success: true, application }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create application." },
      { status: 500 }
    );
  }
}
