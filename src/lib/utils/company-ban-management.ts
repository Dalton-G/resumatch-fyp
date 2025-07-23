import { env } from "@/config/env";
import { prisma } from "@/lib/prisma";
import pc from "@/lib/pinecone";

/**
 * Bans a company user by setting isApproved to false, updating all job postings to CLOSED_BY_ADMIN status,
 * and deactivating all their job posting embeddings
 */
export async function banCompanyUser(
  userId: string,
  adminNotes?: string
): Promise<void> {
  console.log(`🚫 Starting company user ban process for user: ${userId}`);

  try {
    let companyProfile: any = null;

    // Start transaction to ensure data consistency
    await prisma.$transaction(async (tx) => {
      // 1. Update user status
      await tx.user.update({
        where: { id: userId },
        data: {
          isApproved: false,
          updatedAt: new Date(),
        },
      });

      // 2. Get user's company profile if exists
      companyProfile = await tx.companyProfile.findUnique({
        where: { userId },
        include: {
          jobPostings: {
            include: {
              embedding: true,
            },
          },
        },
      });

      if (companyProfile) {
        // 3. Update all job postings status to CLOSED_BY_ADMIN
        if (companyProfile.jobPostings.length > 0) {
          const allJobIds = companyProfile.jobPostings.map(
            (jobPosting: any) => jobPosting.id
          );

          await tx.jobPosting.updateMany({
            where: {
              id: { in: allJobIds },
            },
            data: {
              status: "CLOSED_BY_ADMIN",
              updatedAt: new Date(),
            },
          });

          console.log(
            `📝 Updated ${allJobIds.length} job postings to CLOSED_BY_ADMIN status`
          );
        }

        // 4. Deactivate all job posting embeddings in database
        const jobPostingsWithEmbeddings = companyProfile.jobPostings.filter(
          (jobPosting: any) => jobPosting.embedding
        );

        if (jobPostingsWithEmbeddings.length > 0) {
          const jobIds = jobPostingsWithEmbeddings.map(
            (jobPosting: any) => jobPosting.id
          );

          await tx.jobPostingEmbedding.updateMany({
            where: {
              jobId: { in: jobIds },
            },
            data: {
              active: false,
              updatedAt: new Date(),
            },
          });

          console.log(
            `📝 Deactivated ${jobPostingsWithEmbeddings.length} job posting embeddings in database`
          );
        }
      }
    });

    // 4. Update Pinecone metadata outside transaction
    if (companyProfile) {
      await updatePineconeJobPostingEmbeddingsActive(userId, false);
    }

    console.log(`✅ Company user ${userId} has been banned successfully`);
  } catch (error) {
    console.error(`❌ Failed to ban company user ${userId}:`, error);
    throw new Error(`Failed to ban company user: ${error}`);
  }
}

/**
 * Unbans a company user by setting isApproved to true, restoring job postings to HIRING status
 * (except those with valid reports), and reactivating their job posting embeddings
 * (excluding those that have been reported and marked as "RESOLVED_VALID")
 */
export async function unbanCompanyUser(userId: string): Promise<void> {
  console.log(`✅ Starting company user unban process for user: ${userId}`);

  try {
    let companyProfile: any = null;
    let validJobPostingsToReactivate: string[] = [];

    // Start transaction to ensure data consistency
    await prisma.$transaction(async (tx) => {
      // 1. Update user status
      await tx.user.update({
        where: { id: userId },
        data: {
          isApproved: true,
          updatedAt: new Date(),
        },
      });

      // 2. Get user's company profile if exists
      companyProfile = await tx.companyProfile.findUnique({
        where: { userId },
        include: {
          jobPostings: {
            include: {
              embedding: true,
              reports: {
                where: {
                  status: "RESOLVED_VALID",
                },
              },
            },
          },
        },
      });

      if (companyProfile) {
        // 3. Filter job postings to exclude those with valid reports
        const eligibleJobPostings = companyProfile.jobPostings.filter(
          (jobPosting: any) => {
            // Has embedding and no valid reports
            return jobPosting.embedding && jobPosting.reports.length === 0;
          }
        );

        const reportedJobPostings = companyProfile.jobPostings.filter(
          (jobPosting: any) => jobPosting.reports.length > 0
        );

        // 4. Update job posting statuses based on report status
        if (eligibleJobPostings.length > 0) {
          const eligibleJobIds = eligibleJobPostings.map(
            (jobPosting: any) => jobPosting.id
          );

          // Restore status to HIRING for job postings without valid reports
          await tx.jobPosting.updateMany({
            where: {
              id: { in: eligibleJobIds },
              status: "CLOSED_BY_ADMIN", // Only update those that were closed by admin
            },
            data: {
              status: "HIRING",
              updatedAt: new Date(),
            },
          });

          console.log(
            `📝 Restored ${eligibleJobIds.length} job postings to HIRING status`
          );
        }

        if (reportedJobPostings.length > 0) {
          const reportedJobIds = reportedJobPostings.map(
            (jobPosting: any) => jobPosting.id
          );

          // Keep reported job postings as CLOSED_BY_ADMIN
          console.log(
            `📝 Kept ${reportedJobIds.length} job postings as CLOSED_BY_ADMIN due to valid reports`
          );
        }

        // 5. Reactivate embeddings for eligible job postings
        if (eligibleJobPostings.length > 0) {
          validJobPostingsToReactivate = eligibleJobPostings.map(
            (jobPosting: any) => jobPosting.id
          );

          await tx.jobPostingEmbedding.updateMany({
            where: {
              jobId: { in: validJobPostingsToReactivate },
            },
            data: {
              active: true,
              updatedAt: new Date(),
            },
          });

          console.log(
            `📝 Reactivated ${
              eligibleJobPostings.length
            } job posting embeddings in database (excluded ${
              companyProfile.jobPostings.filter((jp: any) => jp.embedding)
                .length - eligibleJobPostings.length
            } with valid reports)`
          );
        }
      }
    });

    // 4. Update Pinecone metadata outside transaction
    if (companyProfile && validJobPostingsToReactivate.length > 0) {
      await updatePineconeJobPostingEmbeddingsActiveSelective(
        validJobPostingsToReactivate,
        true
      );
    }

    console.log(`✅ Company user ${userId} has been unbanned successfully`);
  } catch (error) {
    console.error(`❌ Failed to unban company user ${userId}:`, error);
    throw new Error(`Failed to unban company user: ${error}`);
  }
}

/**
 * Updates the active status of all job posting embeddings for a company user in Pinecone
 */
async function updatePineconeJobPostingEmbeddingsActive(
  userId: string,
  active: boolean
): Promise<void> {
  try {
    console.log(
      `🌲 Updating Pinecone job posting embeddings active status to ${active} for company user ${userId}`
    );

    // Get user's job posting embeddings
    const companyProfile = await prisma.companyProfile.findUnique({
      where: { userId },
      include: {
        jobPostings: {
          include: {
            embedding: true,
          },
        },
      },
    });

    if (!companyProfile) {
      console.log(`ℹ️ No company profile found for user ${userId}`);
      return;
    }

    const jobPostingsWithEmbeddings = companyProfile.jobPostings.filter(
      (jobPosting) => jobPosting.embedding
    );

    if (jobPostingsWithEmbeddings.length === 0) {
      console.log(
        `ℹ️ No job posting embeddings found for company user ${userId}`
      );
      return;
    }

    // Update Pinecone metadata
    const index = pc.index(env.PINECONE_INDEX_NAME);
    const namespace = index.namespace(env.PINECONE_JOB_NAMESPACE);

    let successCount = 0;
    let errorCount = 0;

    for (const jobPosting of jobPostingsWithEmbeddings) {
      try {
        // Fetch existing vector to preserve all other metadata
        const fetchResponse = await namespace.fetch([jobPosting.id]);

        if (!fetchResponse.records || !fetchResponse.records[jobPosting.id]) {
          console.warn(
            `⚠️ Job posting ${jobPosting.id} not found in Pinecone, skipping`
          );
          errorCount++;
          continue;
        }

        const existingRecord = fetchResponse.records[jobPosting.id];
        const currentMetadata = existingRecord.metadata || {};

        // Update the active status
        await namespace.update({
          id: jobPosting.id,
          metadata: {
            ...currentMetadata,
            active: active,
          },
        });

        successCount++;
        console.log(
          `✅ Updated Pinecone metadata for job posting ${jobPosting.id}: active=${active}`
        );
      } catch (error) {
        console.error(
          `❌ Failed to update Pinecone metadata for job posting ${jobPosting.id}:`,
          error
        );
        errorCount++;
      }
    }

    console.log(
      `📊 Pinecone update summary: ${successCount} successful, ${errorCount} errors`
    );
  } catch (error) {
    console.error(
      `❌ Failed to update Pinecone job posting embeddings for company user ${userId}:`,
      error
    );
    throw error;
  }
}

/**
 * Updates the active status of specific job posting embeddings in Pinecone
 */
async function updatePineconeJobPostingEmbeddingsActiveSelective(
  jobIds: string[],
  active: boolean
): Promise<void> {
  try {
    console.log(
      `🌲 Updating Pinecone job posting embeddings active status to ${active} for ${jobIds.length} job postings`
    );

    // Update Pinecone metadata
    const index = pc.index(env.PINECONE_INDEX_NAME);
    const namespace = index.namespace(env.PINECONE_JOB_NAMESPACE);

    let successCount = 0;
    let errorCount = 0;

    for (const jobId of jobIds) {
      try {
        // Fetch existing vector to preserve all other metadata
        const fetchResponse = await namespace.fetch([jobId]);

        if (!fetchResponse.records || !fetchResponse.records[jobId]) {
          console.warn(
            `⚠️ Job posting ${jobId} not found in Pinecone, skipping`
          );
          errorCount++;
          continue;
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

        successCount++;
        console.log(
          `✅ Updated Pinecone metadata for job posting ${jobId}: active=${active}`
        );
      } catch (error) {
        console.error(
          `❌ Failed to update Pinecone metadata for job posting ${jobId}:`,
          error
        );
        errorCount++;
      }
    }

    console.log(
      `📊 Pinecone selective update summary: ${successCount} successful, ${errorCount} errors`
    );
  } catch (error) {
    console.error(
      `❌ Failed to update selective Pinecone job posting embeddings:`,
      error
    );
    throw error;
  }
}

/**
 * Get the ban status, job posting status counts, and embedding counts for a company user
 */
export async function getCompanyUserBanStatus(userId: string): Promise<{
  isBanned: boolean;
  totalJobPostings: number;
  hiringJobPostings: number;
  closedByAdminJobPostings: number;
  totalJobPostingEmbeddings: number;
  activeJobPostingEmbeddings: number;
  inactiveJobPostingEmbeddings: number;
  jobPostingsWithValidReports: number;
}> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        companyProfile: {
          include: {
            jobPostings: {
              include: {
                embedding: true,
                reports: {
                  where: {
                    status: "RESOLVED_VALID",
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new Error(`User ${userId} not found`);
    }

    const isBanned = !user.isApproved;

    let totalJobPostings = 0;
    let hiringJobPostings = 0;
    let closedByAdminJobPostings = 0;
    let totalJobPostingEmbeddings = 0;
    let activeJobPostingEmbeddings = 0;
    let inactiveJobPostingEmbeddings = 0;
    let jobPostingsWithValidReports = 0;

    if (user.companyProfile) {
      const allJobPostings = user.companyProfile.jobPostings;
      const jobPostingsWithEmbeddings = allJobPostings.filter(
        (jobPosting) => jobPosting.embedding
      );

      // Job posting status counts
      totalJobPostings = allJobPostings.length;
      hiringJobPostings = allJobPostings.filter(
        (jobPosting) => jobPosting.status === "HIRING"
      ).length;
      closedByAdminJobPostings = allJobPostings.filter(
        (jobPosting) => jobPosting.status === "CLOSED_BY_ADMIN"
      ).length;

      // Embedding counts
      totalJobPostingEmbeddings = jobPostingsWithEmbeddings.length;
      activeJobPostingEmbeddings = jobPostingsWithEmbeddings.filter(
        (jobPosting) => jobPosting.embedding?.active === true
      ).length;
      inactiveJobPostingEmbeddings =
        totalJobPostingEmbeddings - activeJobPostingEmbeddings;
      jobPostingsWithValidReports = jobPostingsWithEmbeddings.filter(
        (jobPosting) => jobPosting.reports.length > 0
      ).length;
    }

    return {
      isBanned,
      totalJobPostings,
      hiringJobPostings,
      closedByAdminJobPostings,
      totalJobPostingEmbeddings,
      activeJobPostingEmbeddings,
      inactiveJobPostingEmbeddings,
      jobPostingsWithValidReports,
    };
  } catch (error) {
    console.error(
      `❌ Failed to get ban status for company user ${userId}:`,
      error
    );
    throw error;
  }
}
