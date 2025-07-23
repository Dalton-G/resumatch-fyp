import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { UserRole } from "@prisma/client";
import { env } from "@/config/env";
import pc from "@/lib/pinecone";

const resolveJobReportSchema = z.object({
  status: z.enum(["RESOLVED_VALID", "RESOLVED_INVALID", "DISMISSED"]),
  adminNotes: z.string().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await req.json();
    const validation = resolveJobReportSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.format() },
        { status: 400 }
      );
    }

    const { status, adminNotes } = validation.data;

    // Get admin profile
    const admin = await prisma.adminProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!admin) {
      return NextResponse.json(
        { error: "Admin profile not found" },
        { status: 404 }
      );
    }

    // Get the report with job information
    const report = await prisma.jobReport.findUnique({
      where: { id },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
      },
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    if (report.status !== "PENDING" && report.status !== "UNDER_REVIEW") {
      return NextResponse.json(
        { error: "Report has already been resolved" },
        { status: 400 }
      );
    }

    // Start a database transaction for consistency
    const result = await prisma.$transaction(async (tx) => {
      // Update the report
      const updatedReport = await tx.jobReport.update({
        where: { id },
        data: {
          status,
          adminNotes: adminNotes || null,
          resolvedAt: new Date(),
          resolvedBy: admin.id,
        },
        include: {
          job: {
            select: {
              id: true,
              title: true,
              status: true,
              company: {
                select: {
                  name: true,
                },
              },
            },
          },
          reporter: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      // If the report is resolved as valid, close the job
      if (
        status === "RESOLVED_VALID" &&
        report.job.status !== "CLOSED_BY_ADMIN"
      ) {
        // Update job status to CLOSED_BY_ADMIN
        await tx.jobPosting.update({
          where: { id: report.jobId },
          data: {
            status: "CLOSED_BY_ADMIN",
          },
        });

        // Update JobPostingEmbedding active status
        await tx.jobPostingEmbedding.updateMany({
          where: { jobId: report.jobId },
          data: {
            active: false,
            updatedAt: new Date(),
          },
        });
      }

      return updatedReport;
    });

    // Update Pinecone if job was closed
    if (
      status === "RESOLVED_VALID" &&
      report.job.status !== "CLOSED_BY_ADMIN"
    ) {
      try {
        const index = pc.index(env.PINECONE_INDEX_NAME);
        await index.namespace(env.PINECONE_JOB_NAMESPACE).update({
          id: report.jobId,
          metadata: {
            active: false,
          },
        });
        console.log(
          `Updated Pinecone active status to false for job ${report.jobId}`
        );
      } catch (error) {
        console.error("Error updating Pinecone:", error);
        // Don't fail the entire operation if Pinecone update fails
      }
    }

    return NextResponse.json({
      success: true,
      message: "Report resolved successfully",
      report: {
        id: result.id,
        status: result.status,
        adminNotes: result.adminNotes,
        resolvedAt: result.resolvedAt,
        jobTitle: result.job.title,
        companyName: result.job.company.name,
        reporterName:
          `${result.reporter.firstName || ""} ${
            result.reporter.lastName || ""
          }`.trim() || "Unknown",
        jobClosed: status === "RESOLVED_VALID",
      },
    });
  } catch (error) {
    console.error("Error resolving job report:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
