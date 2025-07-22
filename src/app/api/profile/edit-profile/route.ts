import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { updateResumeEmbeddingsCountry } from "@/lib/utils/resume-metadata-updater";

export async function PUT(request: NextRequest) {
  try {
    // Await and extract query params
    const url = request.nextUrl;
    const userId = await Promise.resolve(url.searchParams.get("userId"));
    const role = await Promise.resolve(url.searchParams.get("role"));
    if (!userId || !role) {
      return NextResponse.json(
        { error: "Missing userId or role" },
        { status: 400 }
      );
    }

    // Auth check
    const session = await auth();
    if (!session || !session.user || session.user.id !== userId) {
      return NextResponse.json({ error: "Not authorized" }, { status: 401 });
    }

    // Parse body
    const body = await request.json();

    // Update logic for job seeker
    if (role === "JOB_SEEKER") {
      // Required fields: firstName, lastName, profilePicture
      const { firstName, lastName, profilePicture, ...profileFields } = body;
      if (!firstName || !lastName || !profilePicture) {
        return NextResponse.json(
          { error: "Missing required fields" },
          { status: 400 }
        );
      }

      // Get current profile to check for country/profession changes
      const currentProfile = await prisma.jobSeekerProfile.findUnique({
        where: { userId },
        select: { country: true, profession: true },
      });

      // Update User
      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          name: `${firstName} ${lastName}`,
          image: profilePicture,
        },
      });

      // Update JobSeekerProfile
      const jobSeekerProfile = await prisma.jobSeekerProfile.update({
        where: { userId },
        data: {
          firstName,
          lastName,
          profilePicture,
          ...profileFields,
        },
      });

      // Check if country or profession changed and update resume embeddings accordingly
      const countryChanged = currentProfile?.country !== profileFields.country;
      const professionChanged =
        currentProfile?.profession !== profileFields.profession;

      if (countryChanged || professionChanged) {
        try {
          console.log(
            `Profile metadata changed for user ${userId}. Country: ${currentProfile?.country} -> ${profileFields.country}, Profession: ${currentProfile?.profession} -> ${profileFields.profession}`
          );

          // Update resume embeddings in background (don't block the response)
          updateResumeEmbeddingsCountry(
            userId,
            profileFields.country || currentProfile?.country || "",
            profileFields.profession || currentProfile?.profession || undefined
          ).catch((error) => {
            console.error(
              "Failed to update resume embeddings metadata:",
              error
            );
            // Log the error but don't fail the profile update
          });

          console.log(
            "Resume embeddings metadata update initiated in background"
          );
        } catch (error) {
          console.error("Error initiating resume embeddings update:", error);
          // Don't fail the profile update, just log the error
        }
      }

      return NextResponse.json({ user, jobSeekerProfile }, { status: 200 });
    }

    // Update logic for company
    if (role === "COMPANY") {
      // Required fields for company
      const {
        name,
        profilePicture,
        website,
        industry,
        size,
        address,
        description,
      } = body;
      if (
        !name ||
        !profilePicture ||
        !website ||
        !industry ||
        !size ||
        !address ||
        !description
      ) {
        return NextResponse.json(
          { error: "Missing required fields" },
          { status: 400 }
        );
      }
      // Update User
      await prisma.user.update({
        where: { id: userId },
        data: {
          name: name,
          image: profilePicture,
        },
      });
      // Update CompanyProfile
      const companyProfile = await prisma.companyProfile.update({
        where: { userId },
        data: {
          name,
          profilePicture,
          website,
          industry,
          size,
          address,
          description,
        },
      });
      return NextResponse.json(companyProfile, { status: 200 });
    }

    // Update logic for admin
    if (role === "ADMIN") {
      const { firstName, lastName, profilePicture } = body;
      if (!firstName || !lastName || !profilePicture) {
        return NextResponse.json(
          { error: "Missing required fields" },
          { status: 400 }
        );
      }
      // Update User
      await prisma.user.update({
        where: { id: userId },
        data: {
          name: `${firstName} ${lastName}`,
          image: profilePicture,
        },
      });
      // Update AdminProfile
      const adminProfile = await prisma.adminProfile.update({
        where: { userId },
        data: {
          firstName,
          lastName,
          profilePicture,
        },
      });
      return NextResponse.json(adminProfile, { status: 200 });
    }

    // If not job seeker, not implemented
    return NextResponse.json(
      { error: "Profile editing for this role is not implemented." },
      { status: 400 }
    );
  } catch (err: any) {
    if (err.code === "P2025") {
      // Prisma not found error
      return NextResponse.json(
        { error: "User or profile not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}
