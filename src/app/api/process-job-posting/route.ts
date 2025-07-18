import { JobPosting } from "@prisma/client";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import {
  constructJobPostingUrl,
  prepareJobPostingContent,
  prepareJobPostingMetadata,
} from "@/lib/rag/document-processor";
import {
  generateJobPostingEmbedding,
  storeJobPostingEmbeddingInPinecone,
} from "@/lib/rag/embedding-service";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Not authorized" }, { status: 401 });
    }

    const { job } = await req.json();
    if (!job) {
      return NextResponse.json(
        { error: "job data is required" },
        { status: 400 }
      );
    }

    const jobPosting = job as JobPosting;

    // 1. Extract and Concatenate job posting content
    const jobPostingContent = prepareJobPostingContent(jobPosting);

    // 2. Construct the URL for the job posting
    const jobPostingUrl = constructJobPostingUrl(jobPosting.id);

    // 3. Prepare the metadata for the job posting
    const jobPostingMetadata = prepareJobPostingMetadata(
      jobPostingContent,
      jobPosting.companyId,
      jobPosting.id,
      jobPostingUrl
    );

    // 4. Generate the embedding for the full job posting
    const jobPostingEmbedding = await generateJobPostingEmbedding(
      jobPostingMetadata
    );

    // 5. Store the job posting embedding in Pinecone
    await storeJobPostingEmbeddingInPinecone(jobPostingEmbedding);

    // 6. Store in Supabase via Prisma
    await prisma.jobPostingEmbedding.create({
      data: {
        id: jobPosting.id,
        companyId: jobPosting.companyId,
        jobId: jobPosting.id,
        content: jobPostingContent,
        embedding: jobPostingEmbedding.embedding,
        active: true,
        source: jobPostingUrl,
      },
    });

    return NextResponse.json(
      {
        message: "Job Posting Processed and Indexed Successfully",
        jobId: jobPosting.id,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing job posting:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
