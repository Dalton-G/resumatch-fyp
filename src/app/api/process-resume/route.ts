import { auth } from "@/lib/auth";
import {
  EmbeddedResumeChunkMetadata,
  ResumeChunkMetadata,
} from "@/lib/model/chunk-metadata";
import { prisma } from "@/lib/prisma";
import { chunkText, prepareResumeMetadata } from "@/lib/rag/document-processor";
import {
  generateEmbeddings,
  storeResumeEmbeddingsInPinecone,
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

    // 1. Extract Text from the s3Url
    const extractedText: string = await extractTextFromS3Url(s3Url);

    // 2. Chunk the extracted text
    const chunks: string[] = chunkText(extractedText);

    // 3. Prepare metadata for each chunk
    const chunkMetadata: ResumeChunkMetadata[] = prepareResumeMetadata(
      chunks,
      jobSeekerId,
      resumeId,
      s3Url
    );

    // 4. Generate Embeddings for each chunks
    const embeddedChunks: EmbeddedResumeChunkMetadata[] =
      await generateEmbeddings(chunkMetadata);

    // 5. Store in Pinecone
    await storeResumeEmbeddingsInPinecone(embeddedChunks);

    // 6. Store in Supabase
    // 6. Store in Supabase (PostgreSQL via Prisma)
    await prisma.resumeChunk.createMany({
      data: embeddedChunks.map((chunk) => ({
        id: chunk.id,
        jobSeekerId: chunk.metadata.jobSeekerId,
        resumeId: chunk.metadata.resumeId,
        chunkIndex: chunk.metadata.chunkIndex,
        totalChunks: chunk.metadata.totalChunks,
        content: chunk.content,
        embedding: chunk.embedding,
        appliedJobIds: [],
        source: chunk.metadata.source,
      })),
      skipDuplicates: true, // in case the job is retried or uploaded twice
    });

    return NextResponse.json(
      {
        message: "Resume processed successfully",
        chunks: embeddedChunks.length,
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
