import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// DELETE /api/jobs/delete/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "COMPANY") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const jobId = id;
  // Only allow delete if the job belongs to the user's company
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
  await prisma.jobPosting.delete({ where: { id: jobId } });
  return NextResponse.json({ success: true }, { status: 200 });
}
