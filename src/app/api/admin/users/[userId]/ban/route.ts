import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { banUser } from "@/lib/utils/user-ban-management";
import { banCompanyUser } from "@/lib/utils/company-ban-management";

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

    // Prevent self-ban
    if (userId === session.user.id) {
      return NextResponse.json(
        { error: "Cannot ban yourself" },
        { status: 400 }
      );
    }

    // Check if user exists and get their role
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        jobSeekerProfile: { select: { id: true } },
        companyProfile: { select: { id: true } },
      },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prevent banning admin users
    if (targetUser.role === "ADMIN") {
      return NextResponse.json(
        { error: "Cannot ban admin users" },
        { status: 400 }
      );
    }

    // Ban the user based on their role
    if (targetUser.companyProfile) {
      // Company user - deactivate job posting embeddings
      await banCompanyUser(userId);
    } else {
      // Job seeker user - deactivate resume embeddings
      await banUser(userId);
    }

    return NextResponse.json({
      success: true,
      message: "User banned successfully",
    });
  } catch (error) {
    console.error("Error banning user:", error);
    return NextResponse.json({ error: "Failed to ban user" }, { status: 500 });
  }
}
