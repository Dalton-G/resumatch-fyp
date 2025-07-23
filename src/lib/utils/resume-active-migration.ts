import { env } from "@/config/env";
import { prisma } from "@/lib/prisma";
import pc from "@/lib/pinecone";

/**
 * Migration utility to add 'active: true' to all existing resume embeddings
 * in both PostgreSQL and Pinecone. This is a one-time migration script.
 */
export async function migrateResumeEmbeddingsActiveField(): Promise<void> {
  console.log(
    "🚀 Starting migration: Adding 'active' field to all resume embeddings..."
  );

  try {
    // Step 1: Update all ResumeEmbedding records in PostgreSQL to set active = true
    console.log("📝 Updating PostgreSQL ResumeEmbedding records...");

    const updateResult = await prisma.resumeEmbedding.updateMany({
      where: {
        // Update all records (no where clause means all)
      },
      data: {
        active: true,
        updatedAt: new Date(),
      },
    });

    console.log(
      `✅ Updated ${updateResult.count} ResumeEmbedding records in PostgreSQL`
    );

    // Step 2: Get all resume embeddings to update their Pinecone metadata
    console.log("🔍 Fetching all resume embeddings for Pinecone update...");

    const allResumeEmbeddings = await prisma.resumeEmbedding.findMany({
      select: {
        id: true,
        resumeId: true,
        jobSeekerId: true,
      },
    });

    console.log(
      `📊 Found ${allResumeEmbeddings.length} resume embeddings to update in Pinecone`
    );

    if (allResumeEmbeddings.length === 0) {
      console.log(
        "ℹ️ No resume embeddings found. Migration completed successfully."
      );
      return;
    }

    // Step 3: Update Pinecone metadata for all resume embeddings
    console.log("🌲 Connecting to Pinecone and updating metadata...");

    const index = pc.index(env.PINECONE_INDEX_NAME);
    const namespace = index.namespace(env.PINECONE_RESUME_NAMESPACE);

    let successCount = 0;
    let errorCount = 0;

    // Process in batches to avoid overwhelming Pinecone
    const batchSize = 10;
    for (let i = 0; i < allResumeEmbeddings.length; i += batchSize) {
      const batch = allResumeEmbeddings.slice(i, i + batchSize);

      console.log(
        `🔄 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(
          allResumeEmbeddings.length / batchSize
        )}...`
      );

      const batchPromises = batch.map(async (resumeEmbedding) => {
        try {
          // Fetch existing vector to preserve all metadata
          const fetchResponse = await namespace.fetch([
            resumeEmbedding.resumeId,
          ]);

          if (
            !fetchResponse.records ||
            !fetchResponse.records[resumeEmbedding.resumeId]
          ) {
            console.warn(
              `⚠️ Resume ${resumeEmbedding.resumeId} not found in Pinecone, skipping`
            );
            return { success: false, error: "Not found in Pinecone" };
          }

          const existingRecord =
            fetchResponse.records[resumeEmbedding.resumeId];
          const currentMetadata = existingRecord.metadata || {};

          // Update metadata with active field
          await namespace.update({
            id: resumeEmbedding.resumeId,
            metadata: {
              ...currentMetadata,
              active: true, // Add the active field
            },
          });

          return { success: true };
        } catch (error) {
          console.error(
            `❌ Failed to update Pinecone metadata for resume ${resumeEmbedding.resumeId}:`,
            error
          );
          return { success: false, error: error };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      const batchSuccessCount = batchResults.filter(
        (result) => result.success
      ).length;
      const batchErrorCount = batchResults.filter(
        (result) => !result.success
      ).length;

      successCount += batchSuccessCount;
      errorCount += batchErrorCount;

      console.log(
        `📈 Batch completed: ${batchSuccessCount} successful, ${batchErrorCount} errors`
      );

      // Small delay between batches to be respectful to Pinecone
      if (i + batchSize < allResumeEmbeddings.length) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    // Step 4: Summary
    console.log("\n📋 Migration Summary:");
    console.log(`✅ PostgreSQL records updated: ${updateResult.count}`);
    console.log(`✅ Pinecone vectors updated successfully: ${successCount}`);
    console.log(`❌ Pinecone update errors: ${errorCount}`);
    console.log(
      `📊 Total resume embeddings processed: ${allResumeEmbeddings.length}`
    );

    if (errorCount > 0) {
      console.log(
        `⚠️ Migration completed with ${errorCount} errors. Please review the logs above.`
      );
    } else {
      console.log(
        "🎉 Migration completed successfully! All resume embeddings now have the 'active' field."
      );
    }
  } catch (error) {
    console.error("💥 Migration failed with error:", error);
    throw new Error(
      `Resume embeddings active field migration failed: ${error}`
    );
  }
}

/**
 * Verification function to check if the migration was successful
 */
export async function verifyResumeEmbeddingsActiveMigration(): Promise<boolean> {
  try {
    console.log("🔍 Verifying migration...");

    // Check PostgreSQL
    const totalEmbeddings = await prisma.resumeEmbedding.count();
    const activeEmbeddings = await prisma.resumeEmbedding.count({
      where: { active: true },
    });

    console.log(`📊 PostgreSQL verification:`);
    console.log(`   Total embeddings: ${totalEmbeddings}`);
    console.log(`   Active embeddings: ${activeEmbeddings}`);

    if (totalEmbeddings !== activeEmbeddings) {
      console.log(
        `❌ PostgreSQL verification failed: Not all embeddings are active`
      );
      return false;
    }

    // Sample check on Pinecone (check first 5 records)
    const sampleEmbeddings = await prisma.resumeEmbedding.findMany({
      take: 5,
      select: { resumeId: true },
    });

    if (sampleEmbeddings.length > 0) {
      const index = pc.index(env.PINECONE_INDEX_NAME);
      const namespace = index.namespace(env.PINECONE_RESUME_NAMESPACE);

      const sampleIds = sampleEmbeddings.map((e) => e.resumeId);
      const fetchResponse = await namespace.fetch(sampleIds);

      let pineconeActiveCount = 0;
      for (const id of sampleIds) {
        const record = fetchResponse.records?.[id];
        if (record?.metadata?.active === true) {
          pineconeActiveCount++;
        }
      }

      console.log(
        `🌲 Pinecone sample verification (${sampleIds.length} records):`
      );
      console.log(`   Records with active=true: ${pineconeActiveCount}`);

      if (pineconeActiveCount !== sampleIds.length) {
        console.log(
          `❌ Pinecone verification failed: Not all sample records have active=true`
        );
        return false;
      }
    }

    console.log("✅ Migration verification successful!");
    return true;
  } catch (error) {
    console.error("❌ Verification failed:", error);
    return false;
  }
}
