import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { UserRole } from "@prisma/client";
import { JobReportsListResponse, JobReportResponse } from "@/types/job-reports";

export async function GET(req: NextRequest) {
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

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Build filter conditions
    const whereConditions: any = {};
    if (status && status !== "all") {
      // Handle comma-separated status values
      const statusArray = status.split(",").map((s) => s.trim());
      if (statusArray.length === 1) {
        whereConditions.status = statusArray[0];
      } else {
        whereConditions.status = {
          in: statusArray,
        };
      }
    }

    // Get total count for pagination
    const totalReports = await prisma.jobReport.count({
      where: whereConditions,
    });

    // Get reports with job and reporter information
    const reports = await prisma.jobReport.findMany({
      where: whereConditions,
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        job: {
          include: {
            company: true,
          },
        },
        reporter: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            user: {
              select: {
                email: true,
              },
            },
          },
        },
        admin: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Format the response with comprehensive null checks
    const formattedReports: JobReportResponse[] = reports.map((report) => ({
      id: report.id,
      reason: report.reason,
      description: report.description || null,
      status: report.status,
      adminNotes: report.adminNotes,
      createdAt: report.createdAt.toISOString(),
      resolvedAt: report.resolvedAt?.toISOString() || null,
      job: {
        id: report.job?.id || "unknown",
        title: report.job?.title || "Unknown Job",
        status: report.job?.status || "UNKNOWN",
        companyName: report.job?.company?.name || "Unknown Company",
      },
      reporter: {
        id: report.reporter?.id || "unknown",
        name:
          `${report.reporter?.firstName || ""} ${
            report.reporter?.lastName || ""
          }`.trim() || "Unknown Reporter",
        email: report.reporter?.user?.email || "unknown@email.com",
      },
      resolvedBy: report.admin
        ? `${report.admin.firstName || ""} ${
            report.admin.lastName || ""
          }`.trim() || "Admin"
        : null,
    }));

    const response: JobReportsListResponse = {
      reports: formattedReports,
      pagination: {
        page,
        limit,
        total: totalReports,
        totalPages: Math.ceil(totalReports / limit),
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching job reports:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
