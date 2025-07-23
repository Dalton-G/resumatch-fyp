import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  migrateResumeEmbeddingsActiveField,
  verifyResumeEmbeddingsActiveMigration,
} from "@/lib/utils/resume-active-migration";

/**
 * Migration API endpoint to add 'active' field to all resume embeddings
 * Only accessible by admin users for safety
 */
export async function POST(req: NextRequest) {
  try {
    // Authenticate and verify admin access
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Access denied. Admin privileges required." },
        { status: 403 }
      );
    }

    const { action } = await req.json();

    if (action === "migrate") {
      console.log(`🚀 Starting resume embeddings active field migration...`);
      console.log(`👤 Initiated by admin: ${session.user.email}`);

      // Execute the migration
      await migrateResumeEmbeddingsActiveField();

      // Verify the migration
      const isVerified = await verifyResumeEmbeddingsActiveMigration();

      return NextResponse.json({
        success: true,
        message:
          "Resume embeddings active field migration completed successfully",
        verified: isVerified,
        timestamp: new Date().toISOString(),
        initiatedBy: session.user.email,
      });
    } else if (action === "verify") {
      console.log(`🔍 Verifying resume embeddings active field migration...`);
      console.log(`👤 Requested by admin: ${session.user.email}`);

      const isVerified = await verifyResumeEmbeddingsActiveMigration();

      return NextResponse.json({
        success: true,
        verified: isVerified,
        message: isVerified
          ? "Migration verification passed"
          : "Migration verification failed - please check logs",
        timestamp: new Date().toISOString(),
        requestedBy: session.user.email,
      });
    } else {
      return NextResponse.json(
        { error: "Invalid action. Use 'migrate' or 'verify'" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Migration API error:", error);
    return NextResponse.json(
      {
        error: "Migration failed",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
