import { openai } from "@ai-sdk/openai";
import {
  EmbeddedResumeChunkMetadata,
  ResumeChunkMetadata,
} from "../model/chunk-metadata";
import { env } from "@/config/env";
import { embed } from "ai";
import pc from "../pinecone";

export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const { embedding } = await embed({
      model: openai.embedding(env.OPENAI_EMBEDDING_MODEL),
      value: text,
    });

    return embedding;
  } catch (error) {
    console.error("Error generating embedding:", error);
    throw new Error(`Failed to generate embedding: ${error}`);
  }
}

export async function generateEmbeddings(
  chunks: ResumeChunkMetadata[]
): Promise<EmbeddedResumeChunkMetadata[]> {
  const embeddedChunks: EmbeddedResumeChunkMetadata[] = [];
  console.log(`Generating embeddings for ${chunks.length} chunks...`);
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    console.log(`Processing chunk ${i + 1}/${chunks.length}`);
    try {
      const embedding = await generateEmbedding(chunk.content);
      embeddedChunks.push({
        ...chunk,
        id: `${chunk.metadata.jobSeekerId}-${chunk.metadata.resumeId}-${chunk.metadata.chunkIndex}`,
        embedding,
      });
    } catch (error) {
      console.error(`Error generating embedding for chunk ${i + 1}:`, error);
      throw error;
    }
  }
  console.log(`Generated embeddings for ${embeddedChunks.length} chunks`);
  return embeddedChunks;
}

export async function storeResumeEmbeddingsInPinecone(
  embeddedChunks: EmbeddedResumeChunkMetadata[]
): Promise<void> {
  try {
    const index = pc.index(env.PINECONE_INDEX_NAME);
    const vectors = embeddedChunks.map((chunk) => ({
      id: chunk.id,
      values: chunk.embedding,
      metadata: {
        content: chunk.content,
        jobSeekerId: chunk.metadata.jobSeekerId,
        resumeId: chunk.metadata.resumeId,
        chunkIndex: chunk.metadata.chunkIndex,
        totalChunks: chunk.metadata.totalChunks,
        source: chunk.metadata.source,
        appliedJobIds: chunk.metadata.appliedJobIds,
      },
    }));
    const batchSize = 100;
    for (let i = 0; i < vectors.length; i += batchSize) {
      const batch = vectors.slice(i, i + batchSize);
      await index.namespace(env.PINECONE_RESUME_NAMESPACE).upsert(batch);
    }
    console.log(`Successfully stored ${vectors.length} embeddings in Pinecone`);
  } catch (error) {
    console.error("Error storing embeddings:", error);
    throw new Error(`Failed to store embeddings: ${error}`);
  }
}
