import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jobPostingSchema } from "@/schema/job-posting-schema";
import { auth } from "@/lib/auth";
import {
  prepareJobPostingContent,
  prepareJobPostingMetadata,
  constructJobPostingUrl,
} from "@/lib/rag/document-processor";
import {
  generateJobPostingEmbedding,
  storeJobPostingEmbeddingInPinecone,
} from "@/lib/rag/embedding-service";
import { JobStatus } from "@prisma/client";
import { env } from "@/config/env";
import pc from "@/lib/pinecone";

// Helper function to determine if job status is active
function isActiveStatus(status: JobStatus): boolean {
  return status === "HIRING" || status === "URGENTLY_HIRING";
}

// Helper function to check if content fields changed
function hasContentChanged(oldJob: any, newData: any): boolean {
  const contentFields = [
    "title",
    "description",
    "location",
    "salaryMin",
    "salaryMax",
    "workType",
  ];
  return contentFields.some((field) => oldJob[field] !== newData[field]);
}

// PATCH /api/jobs/update/[id]
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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

    // Verify company ownership
    const company = await prisma.companyProfile.findUnique({
      where: { userId: session.user.id },
    });
    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    // Get current job with embedding to analyze changes
    const currentJob = await prisma.jobPosting.findUnique({
      where: { id: jobId },
      include: { embedding: true },
    });

    if (!currentJob || currentJob.companyId !== company.id) {
      return NextResponse.json(
        { error: "Not found or forbidden" },
        { status: 403 }
      );
    }

    // Analyze what changed
    const contentChanged = hasContentChanged(currentJob, body);
    const statusChanged = currentJob.status !== body.status;

    console.log(`Job ${jobId} update analysis:`, {
      contentChanged,
      statusChanged,
      oldStatus: currentJob.status,
      newStatus: body.status,
    });

    // 1. Update the job posting in database
    const updatedJob = await prisma.jobPosting.update({
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

    // 2. Handle embedding updates based on what changed
    if (contentChanged) {
      console.log(`Content changed - regenerating embedding for job ${jobId}`);

      // Generate new content and embedding
      const newContent = prepareJobPostingContent(updatedJob);
      const jobPostingUrl = constructJobPostingUrl(jobId);
      const newActive = isActiveStatus(updatedJob.status as JobStatus);

      const jobPostingMetadata = prepareJobPostingMetadata(
        newContent,
        company.id,
        jobId,
        jobPostingUrl,
        newActive
      );

      const embeddedJobPosting = await generateJobPostingEmbedding(
        jobPostingMetadata
      );

      // Upsert to Pinecone (replaces old embedding with same ID)
      await storeJobPostingEmbeddingInPinecone(embeddedJobPosting);

      // Update embedding in database
      await prisma.jobPostingEmbedding.upsert({
        where: { jobId },
        update: {
          content: newContent,
          embedding: embeddedJobPosting.embedding,
          active: newActive,
          source: jobPostingUrl,
          updatedAt: new Date(),
        },
        create: {
          id: jobId,
          companyId: company.id,
          jobId,
          content: newContent,
          embedding: embeddedJobPosting.embedding,
          active: newActive,
          source: jobPostingUrl,
        },
      });

      console.log(`Successfully regenerated embedding for job ${jobId}`);
    } else if (statusChanged && currentJob.embedding) {
      console.log(
        `Only status changed - updating active metadata for job ${jobId}`
      );

      // Only update the active status in metadata (cost-efficient!)
      const newActive = isActiveStatus(updatedJob.status as JobStatus);

      // Update Pinecone metadata only (no new embedding needed)
      const index = pc.index(env.PINECONE_INDEX_NAME);
      await index.namespace(env.PINECONE_JOB_NAMESPACE).update({
        id: jobId,
        metadata: {
          content: currentJob.embedding.content,
          companyId: currentJob.embedding.companyId,
          jobId: currentJob.embedding.jobId,
          source: currentJob.embedding.source || constructJobPostingUrl(jobId),
          active: newActive, // Only this changes
        },
      });

      // Update database embedding record
      await prisma.jobPostingEmbedding.update({
        where: { jobId },
        data: {
          active: newActive,
          updatedAt: new Date(),
        },
      });

      console.log(
        `Successfully updated active status to ${newActive} for job ${jobId}`
      );
    }

    return NextResponse.json(
      {
        ...updatedJob,
        _analysis: {
          contentChanged,
          statusChanged,
          embeddingAction: contentChanged
            ? "regenerated"
            : statusChanged
            ? "metadata_updated"
            : "no_change",
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating job posting:", error);
    return NextResponse.json(
      { error: "Failed to update job posting" },
      { status: 500 }
    );
  }
}
