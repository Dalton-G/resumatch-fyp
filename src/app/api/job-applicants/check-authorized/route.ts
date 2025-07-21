import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json("Unauthorized", { status: 401 });
    }

    const jobId = req.nextUrl.searchParams.get("jobId");

    if (!jobId) {
      return NextResponse.json("Missing userId or jobId", { status: 400 });
    }

    // Get the company ID for the user
    const company = await prisma.companyProfile.findFirst({
      where: {
        userId: session.user.id,
      },
      select: {
        id: true,
      },
    });

    if (!company) {
      return NextResponse.json("Company not found", { status: 404 });
    }

    // Check if the user is authorized to view this job applicant
    const userOwnJobPosting = await prisma.jobPosting.findFirst({
      where: {
        id: jobId,
        companyId: company.id,
      },
      select: {
        id: true,
      },
    });

    const ownsJobPosting = !!userOwnJobPosting;

    return NextResponse.json(
      {
        ownsJobPosting,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error checking authorization:", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
