import { env } from "@/config/env";
import { prisma } from "@/lib/prisma";
import pc from "@/lib/pinecone";
import { JobStatus } from "@prisma/client";

/**
 * Toggles job status between CLOSED_BY_ADMIN and HIRING, with Pinecone sync
 */
export async function toggleJobStatus(jobId: string): Promise<JobStatus> {
  console.log(`🔄 Starting job status toggle for job: ${jobId}`);

  try {
    // Variables to track the new state
    let newStatus: JobStatus = "HIRING"; // Initialize with default
    let newActiveStatus: boolean = true; // Initialize with default
    let hasEmbedding = false;

    // Start transaction to ensure data consistency
    await prisma.$transaction(async (tx) => {
      // 1. Get current job status
      const currentJob = await tx.jobPosting.findUnique({
        where: { id: jobId },
        include: {
          embedding: true,
        },
      });

      if (!currentJob) {
        throw new Error(`Job posting ${jobId} not found`);
      }

      // 2. Determine new status
      if (currentJob.status === "CLOSED_BY_ADMIN") {
        newStatus = "HIRING";
        newActiveStatus = true;
      } else {
        newStatus = "CLOSED_BY_ADMIN";
        newActiveStatus = false;
      }

      hasEmbedding = !!currentJob.embedding;

      // 3. Update job posting status
      await tx.jobPosting.update({
        where: { id: jobId },
        data: {
          status: newStatus,
          updatedAt: new Date(),
        },
      });

      // 4. Update job posting embedding active status if it exists
      if (currentJob.embedding) {
        await tx.jobPostingEmbedding.update({
          where: { jobId: jobId },
          data: {
            active: newActiveStatus,
            updatedAt: new Date(),
          },
        });

        console.log(
          `📝 Updated job posting embedding active status to ${newActiveStatus}`
        );
      }
    });

    // 5. Update Pinecone metadata outside transaction if embedding exists
    if (hasEmbedding) {
      await updateJobPostingPineconeStatus(jobId, newActiveStatus);
    }

    console.log(`✅ Job ${jobId} status toggled to ${newStatus}`);

    return newStatus;
  } catch (error) {
    console.error(`❌ Failed to toggle job status for ${jobId}:`, error);
    throw new Error(`Failed to toggle job status: ${error}`);
  }
}

/**
 * Updates the active status of a job posting embedding in Pinecone
 */
async function updateJobPostingPineconeStatus(
  jobId: string,
  active: boolean
): Promise<void> {
  try {
    console.log(
      `🌲 Updating Pinecone job posting status to active=${active} for job ${jobId}`
    );

    const index = pc.index(env.PINECONE_INDEX_NAME);
    const namespace = index.namespace(env.PINECONE_JOB_NAMESPACE);

    // Fetch existing vector to preserve all other metadata
    const fetchResponse = await namespace.fetch([jobId]);

    if (!fetchResponse.records || !fetchResponse.records[jobId]) {
      console.warn(`⚠️ Job posting ${jobId} not found in Pinecone, skipping`);
      return;
    }

    const existingRecord = fetchResponse.records[jobId];
    const currentMetadata = existingRecord.metadata || {};

    // Update the active status
    await namespace.update({
      id: jobId,
      metadata: {
        ...currentMetadata,
        active: active,
      },
    });

    console.log(
      `✅ Updated Pinecone metadata for job posting ${jobId}: active=${active}`
    );
  } catch (error) {
    console.error(
      `❌ Failed to update Pinecone metadata for job posting ${jobId}:`,
      error
    );
    throw error;
  }
}

/**
 * Get comprehensive job statistics for admin dashboard
 */
export async function getAdminJobStats(): Promise<{
  totalJobs: number;
  activeJobs: number;
  disabledJobs: number;
  urgentlyHiringJobs: number;
  closedJobs: number;
}> {
  try {
    const [
      totalJobs,
      activeJobs,
      disabledJobs,
      urgentlyHiringJobs,
      closedJobs,
    ] = await Promise.all([
      // Total jobs
      prisma.jobPosting.count(),
      // Active jobs (HIRING + URGENTLY_HIRING)
      prisma.jobPosting.count({
        where: {
          status: { in: ["HIRING", "URGENTLY_HIRING"] },
        },
      }),
      // Disabled by admin
      prisma.jobPosting.count({
        where: { status: "CLOSED_BY_ADMIN" },
      }),
      // Urgently hiring
      prisma.jobPosting.count({
        where: { status: "URGENTLY_HIRING" },
      }),
      // Closed naturally
      prisma.jobPosting.count({
        where: { status: "CLOSED" },
      }),
    ]);

    return {
      totalJobs,
      activeJobs,
      disabledJobs,
      urgentlyHiringJobs,
      closedJobs,
    };
  } catch (error) {
    console.error("❌ Failed to get admin job stats:", error);
    throw new Error(`Failed to get job statistics: ${error}`);
  }
}

/**
 * Deletes a job posting completely (admin version with no ownership check)
 */
export async function deleteJobPostingAsAdmin(jobId: string): Promise<void> {
  console.log(`🗑️ Starting admin job deletion for job: ${jobId}`);

  try {
    // Check if job exists
    const job = await prisma.jobPosting.findUnique({
      where: { id: jobId },
      include: { embedding: true },
    });

    if (!job) {
      throw new Error(`Job posting ${jobId} not found`);
    }

    // 1. Delete from Pinecone if embedding exists
    if (job.embedding) {
      console.log(`Deleting job posting embedding from Pinecone...`);
      const index = pc.index(env.PINECONE_INDEX_NAME);
      const namespace = index.namespace(env.PINECONE_JOB_NAMESPACE);
      await namespace.deleteOne(jobId);
      console.log(`✅ Deleted job posting embedding from Pinecone: ${jobId}`);
    }

    // 2. Clean up orphaned appliedJobIds from all resume embeddings
    console.log(`Cleaning up orphaned appliedJobIds from resume embeddings...`);
    await cleanupOrphanedAppliedJobIds(jobId);

    // 3. Delete from database (associated embeddings will cascade delete)
    await prisma.jobPosting.delete({ where: { id: jobId } });

    console.log(
      `✅ Job posting ${jobId} and all associated data deleted successfully`
    );
  } catch (error) {
    console.error(`❌ Failed to delete job posting ${jobId}:`, error);
    throw new Error(`Failed to delete job posting: ${error}`);
  }
}

/**
 * Clean up orphaned appliedJobIds from resume embeddings when job is deleted
 * (Imported from existing utility)
 */
async function cleanupOrphanedAppliedJobIds(
  deletedJobId: string
): Promise<void> {
  try {
    console.log(
      `Starting cleanup of orphaned job ID ${deletedJobId} from all resume embeddings...`
    );

    // Find all resume embeddings that might contain this job ID in appliedJobIds
    // Since appliedJobIds is stored in metadata, we need to fetch all and filter
    const allResumeEmbeddings = await prisma.resumeEmbedding.findMany({
      select: { resumeId: true },
    });

    if (allResumeEmbeddings.length === 0) {
      console.log(
        `No resume embeddings found to check for job ID ${deletedJobId}`
      );
      return;
    }

    console.log(
      `Found ${allResumeEmbeddings.length} resume embeddings potentially containing job ID ${deletedJobId}`
    );

    // Clean up each affected resume embedding
    for (const { resumeId } of allResumeEmbeddings) {
      try {
        await removeResumeAppliedJob(resumeId, deletedJobId);
      } catch (error) {
        console.error(
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
    throw error;
  }
}

/**
 * Remove a job ID from resume's appliedJobIds in Pinecone
 */
async function removeResumeAppliedJob(
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
        try {
          currentAppliedJobIds = JSON.parse(
            currentMetadata.appliedJobIds as string
          );
        } catch {
          currentAppliedJobIds = [currentMetadata.appliedJobIds as string];
        }
      } else if (Array.isArray(currentMetadata.appliedJobIds)) {
        currentAppliedJobIds = currentMetadata.appliedJobIds as string[];
      }
    }

    // Remove the jobId if it exists
    const updatedAppliedJobIds = currentAppliedJobIds.filter(
      (id) => id !== jobId
    );

    if (updatedAppliedJobIds.length === currentAppliedJobIds.length) {
      console.log(
        `Job ID ${jobId} not found in appliedJobIds for resume ${resumeId}`
      );
      return;
    }

    // Update the vector with new metadata
    const updatedVector = {
      id: resumeId,
      values: existingRecord.values,
      metadata: {
        ...currentMetadata,
        appliedJobIds: updatedAppliedJobIds,
      },
    };

    await namespace.upsert([updatedVector]);

    console.log(
      `Successfully removed job ID ${jobId} from resume ${resumeId}. Remaining applied jobs: ${updatedAppliedJobIds.length}`
    );
  } catch (error) {
    console.error(
      `Error removing job ID ${jobId} from resume ${resumeId}:`,
      error
    );
    throw error;
  }
}
