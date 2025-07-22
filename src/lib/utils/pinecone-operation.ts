import { env } from "@/config/env";
import { prisma } from "@/lib/prisma";
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

export async function removeResumeAppliedJob(
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

    // Check if jobId exists in the array
    if (!currentAppliedJobIds.includes(jobId)) {
      console.log(
        `Job ID ${jobId} not found in appliedJobIds for resume ${resumeId}`
      );
      return;
    }

    // Remove the jobId from the array
    const updatedAppliedJobIds = currentAppliedJobIds.filter(
      (id) => id !== jobId
    );

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
      `Successfully removed job ID ${jobId} from resume ${resumeId}. Remaining applied jobs: ${updatedAppliedJobIds.length}`
    );
  } catch (error) {
    console.error(
      `Error removing jobId ${jobId} from resume ${resumeId}:`,
      error
    );
    throw new Error(`Failed to remove job from resume applied jobs: ${error}`);
  }
}

/**
 * Clean up orphaned appliedJobIds from ALL resume embeddings in Pinecone
 * when a job posting is deleted. This prevents accumulation of stale job IDs.
 */
export async function cleanupOrphanedAppliedJobIds(
  deletedJobId: string
): Promise<void> {
  try {
    console.log(
      `Starting cleanup of orphaned job ID ${deletedJobId} from all resume embeddings...`
    );

    // Since Pinecone doesn't support direct metadata-based queries easily,
    // we'll get all resumes that have this job in their appliedJobIds
    // through database lookup first for efficiency
    const affectedResumes = await prisma.jobApplication.findMany({
      where: { jobId: deletedJobId },
      select: { resumeId: true },
      distinct: ["resumeId"],
    });

    if (!affectedResumes || affectedResumes.length === 0) {
      console.log(`No resume embeddings found with job ID ${deletedJobId}`);
      return;
    }

    console.log(
      `Found ${affectedResumes.length} resume embeddings potentially containing job ID ${deletedJobId}`
    );

    // Process each affected resume
    for (const { resumeId } of affectedResumes) {
      try {
        await removeResumeAppliedJob(resumeId, deletedJobId);
      } catch (error) {
        console.warn(
          `Failed to clean job ID ${deletedJobId} from resume ${resumeId}:`,
          error
        );
        // Continue with other resumes even if one fails
      }
    }

    console.log(
      `Completed cleanup of orphaned job ID ${deletedJobId} from resume embeddings`
    );
  } catch (error) {
    console.error(
      `Error during orphaned appliedJobIds cleanup for job ${deletedJobId}:`,
      error
    );
    // Don't throw - this is cleanup, shouldn't block job deletion
  }
}
