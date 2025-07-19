import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json(
      { error: "Missing userId parameter" },
      { status: 400 }
    );
  }

  try {
    const company = await prisma.companyProfile.findUnique({
      where: {
        userId,
      },
    });

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    const jobPostings = await prisma.jobPosting.findMany({
      where: {
        companyId: company.id,
        NOT: {
          status: { in: ["CLOSED", "CLOSED_BY_ADMIN"] },
        },
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        description: true,
        country: true,
        salaryMin: true,
        salaryMax: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        workType: true,
        views: true,
        company: {
          select: {
            id: true,
            name: true,
            profilePicture: true,
          },
        },
      },
    });

    return NextResponse.json(jobPostings, { status: 200 });
  } catch (error) {
    console.error("Error fetching job postings by company:", error);
    return NextResponse.json(
      { error: "Failed to fetch job postings" },
      { status: 500 }
    );
  }
}
