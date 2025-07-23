import { env } from "@/config/env";
import { prisma } from "@/lib/prisma";
import pc from "@/lib/pinecone";

/**
 * Updates country metadata for all resume embeddings belonging to a job seeker
 * This includes both Supabase/PostgreSQL and Pinecone updates
 */
export async function updateResumeEmbeddingsCountry(
  jobSeekerUserId: string,
  newCountry: string,
  newProfession?: string
): Promise<void> {
  try {
    console.log(
      `Starting country update for job seeker ${jobSeekerUserId} to ${newCountry}`
    );

    // Get the JobSeekerProfile to find the associated resumes
    const jobSeeker = await prisma.jobSeekerProfile.findUnique({
      where: { userId: jobSeekerUserId },
      include: {
        resumes: {
          include: {
            embedding: true,
          },
        },
      },
    });

    if (!jobSeeker) {
      throw new Error(
        `Job seeker profile not found for user ${jobSeekerUserId}`
      );
    }

    const resumesWithEmbeddings = jobSeeker.resumes.filter(
      (resume) => resume.embedding
    );

    if (resumesWithEmbeddings.length === 0) {
      console.log(
        `No resume embeddings found for job seeker ${jobSeekerUserId}`
      );
      return;
    }

    console.log(
      `Found ${resumesWithEmbeddings.length} resume embeddings to update`
    );

    // Update Supabase/PostgreSQL resume embeddings
    const updatePromises = resumesWithEmbeddings.map((resume) =>
      prisma.resumeEmbedding.update({
        where: { resumeId: resume.id },
        data: {
          country: newCountry,
          ...(newProfession && { profession: newProfession }),
          updatedAt: new Date(),
        },
      })
    );

    await Promise.all(updatePromises);
    console.log(
      `Updated ${resumesWithEmbeddings.length} resume embeddings in database`
    );

    // Update Pinecone metadata
    const index = pc.index(env.PINECONE_INDEX_NAME);
    const namespace = index.namespace(env.PINECONE_RESUME_NAMESPACE);

    const pineconeUpdatePromises = resumesWithEmbeddings.map(async (resume) => {
      try {
        // Fetch existing vector to preserve all other metadata
        const fetchResponse = await namespace.fetch([resume.id]);

        if (!fetchResponse.records || !fetchResponse.records[resume.id]) {
          console.warn(`Resume ${resume.id} not found in Pinecone, skipping`);
          return;
        }

        const existingRecord = fetchResponse.records[resume.id];
        const currentMetadata = existingRecord.metadata || {};

        // Update the vector with new metadata
        await namespace.update({
          id: resume.id,
          metadata: {
            ...currentMetadata,
            country: newCountry,
            ...(newProfession && { profession: newProfession }),
          },
        });

        console.log(`Updated Pinecone metadata for resume ${resume.id}`);
      } catch (error) {
        console.error(
          `Failed to update Pinecone metadata for resume ${resume.id}:`,
          error
        );
        // Don't throw - continue with other resumes
      }
    });

    await Promise.all(pineconeUpdatePromises);

    console.log(
      `Successfully updated country to ${newCountry} for all resume embeddings of job seeker ${jobSeekerUserId}`
    );
  } catch (error) {
    console.error(`Error updating resume embeddings country:`, error);
    throw new Error(`Failed to update resume embeddings country: ${error}`);
  }
}
