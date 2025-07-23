import { env } from "@/config/env";
import { prisma } from "@/lib/prisma";
import pc from "@/lib/pinecone";

/**
 * Bans a user by setting isApproved to false and deactivating all their resume embeddings
 */
export async function banUser(
  userId: string,
  adminNotes?: string
): Promise<void> {
  console.log(`🚫 Starting user ban process for user: ${userId}`);

  try {
    let jobSeekerProfile: any = null;

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

      // 2. Get user's job seeker profile if exists
      jobSeekerProfile = await tx.jobSeekerProfile.findUnique({
        where: { userId },
        include: {
          resumes: {
            include: {
              embedding: true,
            },
          },
        },
      });

      if (jobSeekerProfile) {
        // 3. Deactivate all resume embeddings in database
        const resumesWithEmbeddings = jobSeekerProfile.resumes.filter(
          (resume: any) => resume.embedding
        );

        if (resumesWithEmbeddings.length > 0) {
          const resumeIds = resumesWithEmbeddings.map(
            (resume: any) => resume.id
          );

          await tx.resumeEmbedding.updateMany({
            where: {
              resumeId: { in: resumeIds },
            },
            data: {
              active: false,
              updatedAt: new Date(),
            },
          });

          console.log(
            `📝 Deactivated ${resumesWithEmbeddings.length} resume embeddings in database`
          );
        }
      }
    });

    // 4. Update Pinecone metadata outside transaction
    if (jobSeekerProfile) {
      await updatePineconeResumeEmbeddingsActive(userId, false);
    }

    console.log(`✅ User ${userId} has been banned successfully`);
  } catch (error) {
    console.error(`❌ Failed to ban user ${userId}:`, error);
    throw new Error(`Failed to ban user: ${error}`);
  }
}

/**
 * Unbans a user by setting isApproved to true and reactivating all their resume embeddings
 */
export async function unbanUser(userId: string): Promise<void> {
  console.log(`✅ Starting user unban process for user: ${userId}`);

  try {
    let jobSeekerProfile: any = null;

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

      // 2. Get user's job seeker profile if exists
      jobSeekerProfile = await tx.jobSeekerProfile.findUnique({
        where: { userId },
        include: {
          resumes: {
            include: {
              embedding: true,
            },
          },
        },
      });

      if (jobSeekerProfile) {
        // 3. Reactivate all resume embeddings in database
        const resumesWithEmbeddings = jobSeekerProfile.resumes.filter(
          (resume: any) => resume.embedding
        );

        if (resumesWithEmbeddings.length > 0) {
          const resumeIds = resumesWithEmbeddings.map(
            (resume: any) => resume.id
          );

          await tx.resumeEmbedding.updateMany({
            where: {
              resumeId: { in: resumeIds },
            },
            data: {
              active: true,
              updatedAt: new Date(),
            },
          });

          console.log(
            `📝 Reactivated ${resumesWithEmbeddings.length} resume embeddings in database`
          );
        }
      }
    });

    // 4. Update Pinecone metadata outside transaction
    if (jobSeekerProfile) {
      await updatePineconeResumeEmbeddingsActive(userId, true);
    }

    console.log(`✅ User ${userId} has been unbanned successfully`);
  } catch (error) {
    console.error(`❌ Failed to unban user ${userId}:`, error);
    throw new Error(`Failed to unban user: ${error}`);
  }
}

/**
 * Updates the active status of all resume embeddings for a user in Pinecone
 */
async function updatePineconeResumeEmbeddingsActive(
  userId: string,
  active: boolean
): Promise<void> {
  try {
    console.log(
      `🌲 Updating Pinecone resume embeddings active status to ${active} for user ${userId}`
    );

    // Get user's resume embeddings
    const jobSeekerProfile = await prisma.jobSeekerProfile.findUnique({
      where: { userId },
      include: {
        resumes: {
          include: {
            embedding: true,
          },
        },
      },
    });

    if (!jobSeekerProfile) {
      console.log(`ℹ️ No job seeker profile found for user ${userId}`);
      return;
    }

    const resumesWithEmbeddings = jobSeekerProfile.resumes.filter(
      (resume) => resume.embedding
    );

    if (resumesWithEmbeddings.length === 0) {
      console.log(`ℹ️ No resume embeddings found for user ${userId}`);
      return;
    }

    // Update Pinecone metadata
    const index = pc.index(env.PINECONE_INDEX_NAME);
    const namespace = index.namespace(env.PINECONE_RESUME_NAMESPACE);

    let successCount = 0;
    let errorCount = 0;

    for (const resume of resumesWithEmbeddings) {
      try {
        // Fetch existing vector to preserve all other metadata
        const fetchResponse = await namespace.fetch([resume.id]);

        if (!fetchResponse.records || !fetchResponse.records[resume.id]) {
          console.warn(
            `⚠️ Resume ${resume.id} not found in Pinecone, skipping`
          );
          errorCount++;
          continue;
        }

        const existingRecord = fetchResponse.records[resume.id];
        const currentMetadata = existingRecord.metadata || {};

        // Update the active status
        await namespace.update({
          id: resume.id,
          metadata: {
            ...currentMetadata,
            active: active,
          },
        });

        successCount++;
        console.log(
          `✅ Updated Pinecone metadata for resume ${resume.id}: active=${active}`
        );
      } catch (error) {
        console.error(
          `❌ Failed to update Pinecone metadata for resume ${resume.id}:`,
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
      `❌ Failed to update Pinecone resume embeddings for user ${userId}:`,
      error
    );
    throw error;
  }
}

/**
 * Get the ban status and resume embedding counts for a user
 */
export async function getUserBanStatus(userId: string): Promise<{
  isBanned: boolean;
  totalResumeEmbeddings: number;
  activeResumeEmbeddings: number;
  inactiveResumeEmbeddings: number;
}> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        jobSeekerProfile: {
          include: {
            resumes: {
              include: {
                embedding: true,
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

    let totalResumeEmbeddings = 0;
    let activeResumeEmbeddings = 0;
    let inactiveResumeEmbeddings = 0;

    if (user.jobSeekerProfile) {
      const resumesWithEmbeddings = user.jobSeekerProfile.resumes.filter(
        (resume) => resume.embedding
      );

      totalResumeEmbeddings = resumesWithEmbeddings.length;
      activeResumeEmbeddings = resumesWithEmbeddings.filter(
        (resume) => resume.embedding?.active === true
      ).length;
      inactiveResumeEmbeddings = totalResumeEmbeddings - activeResumeEmbeddings;
    }

    return {
      isBanned,
      totalResumeEmbeddings,
      activeResumeEmbeddings,
      inactiveResumeEmbeddings,
    };
  } catch (error) {
    console.error(`❌ Failed to get ban status for user ${userId}:`, error);
    throw error;
  }
}
