import { openai } from "@ai-sdk/openai";
import {
  EmbeddedJobPostingMetadata,
  EmbeddedResumeMetadata,
  JobPostingMetadata,
  ResumeMetadata,
} from "../model/chunk-metadata";
import { env } from "@/config/env";
import { embed } from "ai";
import pc from "../pinecone";
import { count } from "console";

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

export async function generateJobPostingEmbedding(
  jobPostingMetadata: JobPostingMetadata
): Promise<EmbeddedJobPostingMetadata> {
  console.log(`Generating embedding for job posting...`);
  try {
    const embedding = await generateEmbedding(jobPostingMetadata.content);
    const embeddedJobPosting: EmbeddedJobPostingMetadata = {
      ...jobPostingMetadata,
      id: jobPostingMetadata.metadata.jobId,
      embedding,
    };
    console.log(
      `Generated embedding for job posting ${jobPostingMetadata.metadata.jobId}`
    );
    return embeddedJobPosting;
  } catch (error) {
    console.error(`Error generating embedding for job posting:`, error);
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
        country: embeddedResume.metadata.country,
        profession: embeddedResume.metadata.profession,
      },
    };

    await index.namespace(env.PINECONE_RESUME_NAMESPACE).upsert([vector]);
    console.log(`Successfully stored resume embedding in Pinecone`);
  } catch (error) {
    console.error("Error storing embedding:", error);
    throw new Error(`Failed to store embedding: ${error}`);
  }
}

export async function storeJobPostingEmbeddingInPinecone(
  embeddedJobPosting: EmbeddedJobPostingMetadata
): Promise<void> {
  try {
    const index = pc.index(env.PINECONE_INDEX_NAME);
    const vector = {
      id: embeddedJobPosting.id,
      values: embeddedJobPosting.embedding,
      metadata: {
        content: embeddedJobPosting.content,
        companyId: embeddedJobPosting.metadata.companyId,
        jobId: embeddedJobPosting.metadata.jobId,
        source: embeddedJobPosting.metadata.source,
        active: embeddedJobPosting.metadata.active,
        position: embeddedJobPosting.metadata.position,
        salaryMin: embeddedJobPosting.metadata.salaryMin,
        salaryMax: embeddedJobPosting.metadata.salaryMax,
        workType: embeddedJobPosting.metadata.workType,
        country: embeddedJobPosting.metadata.country,
      },
    };

    await index.namespace(env.PINECONE_JOB_NAMESPACE).upsert([vector]);
    console.log(`Successfully stored job posting embedding in Pinecone`);
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

export async function deleteJobPostingEmbeddingFromPinecone(
  jobId: string
): Promise<void> {
  try {
    const index = pc.index(env.PINECONE_INDEX_NAME);
    const namespace = index.namespace(env.PINECONE_JOB_NAMESPACE);
    await namespace.deleteOne(jobId);
    console.log(
      `Successfully deleted job posting embedding from Pinecone: ${jobId}`
    );
  } catch (error) {
    console.error("Error deleting embedding from Pinecone:", error);
    throw new Error(`Failed to delete embedding from Pinecone: ${error}`);
  }
}
