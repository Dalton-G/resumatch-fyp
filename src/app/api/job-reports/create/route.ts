import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { UserRole } from "@prisma/client";

const createJobReportSchema = z.object({
  jobId: z.string().min(1, "Job ID is required"),
  reason: z.enum([
    "SPAM",
    "FAKE_JOB",
    "INAPPROPRIATE_CONTENT",
    "MISLEADING_INFORMATION",
    "DISCRIMINATORY",
    "SCAM",
    "OTHER",
  ]),
  description: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== UserRole.JOB_SEEKER) {
      return NextResponse.json(
        { error: "Only job seekers can report jobs" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validation = createJobReportSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.format() },
        { status: 400 }
      );
    }

    const { jobId, reason, description } = validation.data;

    // Get job seeker profile
    const jobSeeker = await prisma.jobSeekerProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!jobSeeker) {
      return NextResponse.json(
        { error: "Job seeker profile not found" },
        { status: 404 }
      );
    }

    // Check if job exists and is not already closed by admin
    const job = await prisma.jobPosting.findUnique({
      where: { id: jobId },
      select: { id: true, status: true, title: true },
    });

    if (!job) {
      return NextResponse.json(
        { error: "Job posting not found" },
        { status: 404 }
      );
    }

    if (job.status === "CLOSED_BY_ADMIN") {
      return NextResponse.json(
        { error: "This job has already been closed by administrators" },
        { status: 400 }
      );
    }

    // Check if user has already reported this job
    const existingReport = await prisma.jobReport.findUnique({
      where: {
        jobId_reporterId: {
          jobId,
          reporterId: jobSeeker.id,
        },
      },
    });

    if (existingReport) {
      return NextResponse.json(
        { error: "You have already reported this job" },
        { status: 400 }
      );
    }

    // Create the report
    const report = await prisma.jobReport.create({
      data: {
        jobId,
        reporterId: jobSeeker.id,
        reason,
        description: description || null,
      },
      include: {
        job: {
          select: {
            title: true,
            company: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Job report submitted successfully",
        report: {
          id: report.id,
          jobTitle: report.job.title,
          companyName: report.job.company.name,
          reason: report.reason,
          status: report.status,
          createdAt: report.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating job report:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
