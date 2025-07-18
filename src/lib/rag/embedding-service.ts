import { openai } from "@ai-sdk/openai";
import {
  EmbeddedResumeMetadata,
  ResumeMetadata,
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

export async function generateResumeEmbedding(
  resumeMetadata: ResumeMetadata
): Promise<EmbeddedResumeMetadata> {
  console.log(`Generating embedding for resume...`);
  try {
    const embedding = await generateEmbedding(resumeMetadata.content);
    const embeddedResume: EmbeddedResumeMetadata = {
      ...resumeMetadata,
      id: resumeMetadata.metadata.resumeId,
      embedding,
    };
    console.log(
      `Generated embedding for resume ${resumeMetadata.metadata.resumeId}`
    );
    return embeddedResume;
  } catch (error) {
    console.error(`Error generating embedding for resume:`, error);
    throw error;
  }
}

export async function storeResumeEmbeddingInPinecone(
  embeddedResume: EmbeddedResumeMetadata
): Promise<void> {
  try {
    const index = pc.index(env.PINECONE_INDEX_NAME);
    const vector = {
      id: embeddedResume.id,
      values: embeddedResume.embedding,
      metadata: {
        content: embeddedResume.content,
        jobSeekerId: embeddedResume.metadata.jobSeekerId,
        resumeId: embeddedResume.metadata.resumeId,
        source: embeddedResume.metadata.source,
        appliedJobIds: embeddedResume.metadata.appliedJobIds,
      },
    };

    await index.namespace(env.PINECONE_RESUME_NAMESPACE).upsert([vector]);
    console.log(`Successfully stored resume embedding in Pinecone`);
  } catch (error) {
    console.error("Error storing embedding:", error);
    throw new Error(`Failed to store embedding: ${error}`);
  }
}

export async function deleteResumeEmbeddingFromPinecone(
  resumeId: string
): Promise<void> {
  try {
    const index = pc.index(env.PINECONE_INDEX_NAME);
    const namespace = index.namespace(env.PINECONE_RESUME_NAMESPACE);

    await namespace.deleteOne(resumeId);
    console.log(
      `Successfully deleted resume embedding from Pinecone: ${resumeId}`
    );
  } catch (error) {
    console.error("Error deleting embedding from Pinecone:", error);
    throw new Error(`Failed to delete embedding from Pinecone: ${error}`);
  }
}
