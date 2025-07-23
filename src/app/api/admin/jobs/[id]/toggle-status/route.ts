import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { toggleJobStatus } from "@/lib/utils/admin-job-management";

export async function POST(
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

    // Toggle job status using the utility function
    const newStatus = await toggleJobStatus(jobId);

    return NextResponse.json(
      {
        message: `Job status toggled successfully`,
        newStatus,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error toggling job status:", error);
    return NextResponse.json(
      { error: "Failed to toggle job status" },
      { status: 500 }
    );
  }
}
