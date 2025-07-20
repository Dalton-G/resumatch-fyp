import { env } from "@/config/env";
import pc from "../pinecone";

export async function updateResumeAppliedJobs(
  resumeId: string,
  jobId: string
): Promise<void> {
  try {
    const index = pc.index(env.PINECONE_INDEX_NAME);
    const namespace = index.namespace(env.PINECONE_RESUME_NAMESPACE);

    // Fetch the current vector to get existing metadata
    const fetchResponse = await namespace.fetch([resumeId]);

    if (!fetchResponse.records || !fetchResponse.records[resumeId]) {
      console.warn(`Resume with ID ${resumeId} not found in Pinecone`);
      return;
    }

    const existingRecord = fetchResponse.records[resumeId];
    const currentMetadata = existingRecord.metadata || {};

    // Handle appliedJobIds - it might be stored as a string or array
    let currentAppliedJobIds: string[] = [];
    if (currentMetadata.appliedJobIds) {
      if (typeof currentMetadata.appliedJobIds === "string") {
        // If it's a string, try to parse it as JSON
        try {
          currentAppliedJobIds = JSON.parse(
            currentMetadata.appliedJobIds as string
          );
        } catch {
          // If parsing fails, treat it as a single job ID
          currentAppliedJobIds = [currentMetadata.appliedJobIds as string];
        }
      } else if (Array.isArray(currentMetadata.appliedJobIds)) {
        currentAppliedJobIds = currentMetadata.appliedJobIds as string[];
      }
    }

    // Only add jobId if it's not already in the array
    if (currentAppliedJobIds.includes(jobId)) {
      console.log(
        `Job ID ${jobId} already exists in appliedJobIds for resume ${resumeId}`
      );
      return;
    }

    const updatedAppliedJobIds = [...currentAppliedJobIds, jobId];

    // Update the vector with new metadata - ensure appliedJobIds is an array of strings
    const updatedVector = {
      id: resumeId,
      values: existingRecord.values,
      metadata: {
        ...currentMetadata,
        appliedJobIds: updatedAppliedJobIds, // This should be an array of strings
      },
    };

    await namespace.upsert([updatedVector]);

    console.log(
      `Successfully updated resume ${resumeId} with job ID ${jobId}. Total applied jobs: ${updatedAppliedJobIds.length}`
    );
  } catch (error) {
    console.error(
      `Error updating appliedJobIds for resume ${resumeId}:`,
      error
    );
    throw new Error(`Failed to update resume applied jobs: ${error}`);
  }
}
