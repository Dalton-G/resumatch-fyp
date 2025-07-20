import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { removeResumeAppliedJob } from "@/lib/utils/pinecone-operation";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;

    // 1. Check If Job Application & ResumeEmbeddings Exists
    const application = await prisma.jobApplication.findUnique({
      where: {
        id,
      },
    });

    if (!application) {
      return NextResponse.json(
        { message: "Job Application not found" },
        { status: 404 }
      );
    }

    const resumeEmbedding = await prisma.resumeEmbedding.findUnique({
      where: { resumeId: application.resumeId },
      select: { appliedJobIds: true },
    });

    if (!resumeEmbedding) {
      return NextResponse.json(
        { message: "Resume Embedding Not Found" },
        { status: 404 }
      );
    }

    // 2. Delete from Job Application Table
    await prisma.jobApplication.delete({
      where: { id },
    });

    // 3. Delete Job Id in appliedJobIds from Resume in Pinecone
    await removeResumeAppliedJob(application.resumeId, application.jobId);

    // 4. Update the ResumeEmbeddings in Supabase
    const updatedAppliedJobIds = resumeEmbedding.appliedJobIds.filter(
      (id) => id !== application.jobId
    );
    await prisma.resumeEmbedding.update({
      where: { resumeId: application.resumeId },
      data: {
        appliedJobIds: {
          set: updatedAppliedJobIds,
        },
      },
    });

    return NextResponse.json(
      { message: "Job application deleted" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting job application:", error);
    return NextResponse.json(
      { error: "Failed to delete job application" },
      { status: 500 }
    );
  }
}
