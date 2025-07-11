import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const userIdSchema = z.string().min(1, "User ID is required");

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  const params = await context.params;

  // Validate userId
  const parseResult = userIdSchema.safeParse(params.userId);
  if (!parseResult.success) {
    return NextResponse.json({ error: "Invalid userId" }, { status: 400 });
  }
  const userId = params.userId;

  try {
    // Fetch user and profile (all roles)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        jobSeekerProfile: true,
        companyProfile: true,
        adminProfile: true,
      },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Determine profile and increment views
    let profile: any = null;
    let profileType:
      | "jobSeekerProfile"
      | "companyProfile"
      | "adminProfile"
      | null = null;
    if (user.jobSeekerProfile) {
      profile = user.jobSeekerProfile;
      profileType = "jobSeekerProfile";
    } else if (user.companyProfile) {
      profile = user.companyProfile;
      profileType = "companyProfile";
    } else if (user.adminProfile) {
      profile = user.adminProfile;
      profileType = "adminProfile";
    }
    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    if (!profileType) {
      // This should never happen, but TypeScript needs the guard
      return NextResponse.json(
        { error: "Profile type not found" },
        { status: 500 }
      );
    }

    // Increment views
    switch (profileType) {
      case "jobSeekerProfile":
        await prisma.jobSeekerProfile.update({
          where: { id: profile.id },
          data: { views: { increment: 1 } },
        });
        break;
      case "companyProfile":
        await prisma.companyProfile.update({
          where: { id: profile.id },
          data: { views: { increment: 1 } },
        });
        break;
      case "adminProfile":
        await prisma.adminProfile.update({
          where: { id: profile.id },
          data: { views: { increment: 1 } },
        });
        break;
      default:
        return NextResponse.json(
          { error: "Profile type not found" },
          { status: 500 }
        );
    }

    // Normalize response (exclude sensitive fields)
    const publicUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      role: user.role,
    };
    // Remove undefined fields
    Object.keys(publicUser).forEach(
      (k) =>
        publicUser[k as keyof typeof publicUser] === undefined &&
        delete publicUser[k as keyof typeof publicUser]
    );

    // Remove sensitive profile fields
    const { id, userId: _userId, ...publicProfile } = profile;

    return NextResponse.json({
      ...publicUser,
      ...publicProfile,
      profileType,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
