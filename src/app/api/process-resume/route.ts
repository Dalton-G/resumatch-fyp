import { auth } from "@/lib/auth";
import {
  EmbeddedResumeMetadata,
  ResumeMetadata,
} from "@/lib/model/chunk-metadata";
import { prisma } from "@/lib/prisma";
import { prepareResumeMetadata } from "@/lib/rag/document-processor";
import {
  generateResumeEmbedding,
  storeResumeEmbeddingInPinecone,
} from "@/lib/rag/embedding-service";
import { extractTextFromS3Url } from "@/lib/utils/extract-text-from-s3url";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Not authorized" }, { status: 401 });
    }
    const jobSeekerId = session.user.id;
    const { s3Url, resumeId } = await req.json();

    console.log("Received request: ", s3Url, resumeId);

    if (!s3Url || !resumeId) {
      return NextResponse.json(
        { error: "s3Url and resumeId is required" },
        { status: 400 }
      );
    }

    // Get the job seeker profile
    const jobSeekerProfile = await prisma.jobSeekerProfile.findUnique({
      where: { userId: jobSeekerId },
    });

    if (!jobSeekerProfile?.country || !jobSeekerProfile?.profession) {
      return NextResponse.json(
        {
          error:
            "Job seeker profile not found or country/profession is missing",
        },
        { status: 404 }
      );
    }

    // 1. Extract Text from the s3Url
    const extractedText: string = await extractTextFromS3Url(s3Url);

    // 2. Prepare metadata for the full resume content
    const resumeMetadata: ResumeMetadata = prepareResumeMetadata(
      extractedText,
      jobSeekerId,
      resumeId,
      s3Url,
      jobSeekerProfile.country,
      jobSeekerProfile.profession
    );

    // 3. Generate Embedding for the full resume
    const embeddedResume: EmbeddedResumeMetadata =
      await generateResumeEmbedding(resumeMetadata);

    // 4. Store in Pinecone
    await storeResumeEmbeddingInPinecone(embeddedResume);

    // 5. Store in PostgreSQL via Prisma
    await prisma.resumeEmbedding.create({
      data: {
        id: embeddedResume.id,
        jobSeekerId: embeddedResume.metadata.jobSeekerId,
        resumeId: embeddedResume.metadata.resumeId,
        content: embeddedResume.content,
        embedding: embeddedResume.embedding,
        appliedJobIds: [],
        source: embeddedResume.metadata.source,
        country: embeddedResume.metadata.country,
        profession: embeddedResume.metadata.profession,
      },
    });

    return NextResponse.json(
      {
        message: "Resume processed successfully",
        resumeId: embeddedResume.metadata.resumeId,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error processing resume:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process resume" },
      { status: 500 }
    );
  }
}
