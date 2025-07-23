import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { unbanUser } from "@/lib/utils/user-ban-management";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const { prisma } = await import("@/lib/prisma");
    const adminUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!adminUser || adminUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { userId } = await params;

    // Unban the user
    const result = await unbanUser(userId);

    return NextResponse.json({
      success: true,
      message: "User unbanned successfully",
      result,
    });
  } catch (error) {
    console.error("Error unbanning user:", error);
    return NextResponse.json(
      { error: "Failed to unban user" },
      { status: 500 }
    );
  }
}
