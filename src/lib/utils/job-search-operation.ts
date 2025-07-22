import { env } from "@/config/env";
import pc from "../pinecone";

interface JobSearchFilters {
  salaryMin?: number;
  salaryMax?: number;
  position?: string;
  workType?: string;
  country?: string;
  appliedJobIds?: string[];
}

export async function searchSimilarJobs(
  resumeEmbedding: number[],
  filters: JobSearchFilters,
  topK: number = 5
) {
  try {
    const index = pc.index(env.PINECONE_INDEX_NAME);
    const namespace = index.namespace(env.PINECONE_JOB_NAMESPACE);

    // Build filter object
    const pineconeFilters: any = {
      active: { $eq: true },
    };

    if (filters.salaryMin) {
      pineconeFilters.salaryMin = { $gte: filters.salaryMin };
    }
    if (filters.salaryMax) {
      pineconeFilters.salaryMax = { $lte: filters.salaryMax };
    }
    if (filters.position) {
      pineconeFilters.position = { $eq: filters.position };
    }
    if (filters.workType) {
      pineconeFilters.workType = { $eq: filters.workType };
    }
    if (filters.country) {
      pineconeFilters.country = { $eq: filters.country };
    }
    if (filters.appliedJobIds && filters.appliedJobIds.length > 0) {
      pineconeFilters.jobId = { $nin: filters.appliedJobIds };
    }

    const queryResponse = await namespace.query({
      vector: resumeEmbedding,
      topK,
      filter: pineconeFilters,
      includeMetadata: true,
      includeValues: false,
    });

    return queryResponse;
  } catch (error) {
    console.error("Error searching similar jobs in Pinecone:", error);
    throw new Error(`Failed to search jobs: ${error}`);
  }
}
