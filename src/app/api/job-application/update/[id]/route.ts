import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { ApplicationStatus } from "@prisma/client";

// PATCH /api/job-application/update/[id]
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    const body = await req.json();
    const { status, feedback, notes } = body;

    // Only allow company or admin to update
    if (session.user.role !== "COMPANY" && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Find the application
    const application = await prisma.jobApplication.findUnique({
      where: { id },
      include: {
        job: {
          select: { companyId: true },
        },
      },
    });
    if (!application) {
      return NextResponse.json(
        { error: "Job application not found" },
        { status: 404 }
      );
    }

    // If company, check ownership
    if (session.user.role === "COMPANY") {
      const company = await prisma.companyProfile.findUnique({
        where: { userId: session.user.id },
      });
      if (!company || company.id !== application.job.companyId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    // Validate status
    if (status && !Object.values(ApplicationStatus).includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Update application
    const updated = await prisma.jobApplication.update({
      where: { id },
      data: {
        status: status || application.status,
        feedback:
          typeof feedback === "string" ? feedback : application.feedback,
        notes: typeof notes === "string" ? notes : application.notes,
      },
    });

    return NextResponse.json({ application: updated }, { status: 200 });
  } catch (error) {
    console.error("Error updating job application:", error);
    return NextResponse.json(
      { error: "Failed to update job application" },
      { status: 500 }
    );
  }
}
