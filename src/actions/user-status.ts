import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { pages } from "@/config/directory";

/**
 * Server action to check if the current user is banned
 * Returns the user's approval status
 */
export async function checkUserBanStatus(): Promise<{
  isApproved: boolean;
  userId: string;
}> {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("No authenticated user found");
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        isApproved: true,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return {
      isApproved: user.isApproved,
      userId: user.id,
    };
  } catch (error) {
    console.error("Error checking user ban status:", error);
    throw new Error("Failed to check user status");
  }
}

/**
 * Server action that redirects banned users to the banned page
 * Should be called in layouts or pages that need to protect against banned users
 */
export async function redirectIfBanned(): Promise<void> {
  let banStatus;

  try {
    banStatus = await checkUserBanStatus();
  } catch (error) {
    console.error("Error checking user ban status:", error);
    // Don't redirect on error - let the user continue but log the issue
    return;
  }

  if (!banStatus.isApproved) {
    redirect(pages.banned);
  }
}
