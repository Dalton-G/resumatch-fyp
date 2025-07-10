import {
  JobSeekerProfile,
  CompanyProfile,
  AdminProfile,
  UserRole,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get("userId");
  const role = searchParams.get("role");

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  if (!role) {
    return NextResponse.json({ error: "Role is required" }, { status: 400 });
  }

  try {
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch the appropriate profile based on role
    let profile: JobSeekerProfile | CompanyProfile | AdminProfile | null = null;

    switch (role.toUpperCase()) {
      case UserRole.JOB_SEEKER:
        profile = await prisma.jobSeekerProfile.findUnique({
          where: { userId },
        });
        break;
      case UserRole.COMPANY:
        profile = await prisma.companyProfile.findUnique({
          where: { userId },
        });
        break;
      case UserRole.ADMIN:
        profile = await prisma.adminProfile.findUnique({
          where: { userId },
        });
        break;
      default:
        return NextResponse.json(
          { error: "Invalid role specified" },
          { status: 400 }
        );
    }

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json({ profile }, { status: 200 });
  } catch (error) {
    console.error("Error retrieving profile:", error);
    return NextResponse.json(
      { error: "Failed to retrieve profile" },
      { status: 500 }
    );
  }
}
