import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jobPostingSchema } from "@/schema/job-posting-schema";
import { auth } from "@/lib/auth";

// PATCH /api/jobs/update/[id]
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "COMPANY") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const jobId = id;
  const body = await req.json();
  const parse = jobPostingSchema.safeParse(body);
  if (!parse.success) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }
  // Only allow update if the job belongs to the user's company
  const company = await prisma.companyProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!company) {
    return NextResponse.json({ error: "Company not found" }, { status: 404 });
  }
  const job = await prisma.jobPosting.findUnique({ where: { id: jobId } });
  if (!job || job.companyId !== company.id) {
    return NextResponse.json(
      { error: "Not found or forbidden" },
      { status: 403 }
    );
  }
  const updated = await prisma.jobPosting.update({
    where: { id: jobId },
    data: {
      title: body.title,
      description: body.description,
      location: body.location,
      workType: body.workType,
      status: body.status,
      salaryMin: body.salaryMin,
      salaryMax: body.salaryMax,
    },
  });
  return NextResponse.json(updated, { status: 200 });
}
