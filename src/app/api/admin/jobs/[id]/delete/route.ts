import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { deleteJobPostingAsAdmin } from "@/lib/utils/admin-job-management";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const jobId = id;

    // Delete job posting using the utility function
    await deleteJobPostingAsAdmin(jobId);

    return NextResponse.json(
      {
        message: "Job posting deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting job:", error);
    return NextResponse.json(
      { error: "Failed to delete job posting" },
      { status: 500 }
    );
  }
}
