import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get unique professions from job seeker profiles
    const professions = await prisma.jobSeekerProfile.findMany({
      where: {
        profession: {
          not: null,
        },
      },
      select: {
        profession: true,
      },
      distinct: ["profession"],
      orderBy: {
        profession: "asc",
      },
    });

    const uniqueProfessions = professions
      .map((p) => p.profession)
      .filter(Boolean)
      .sort();

    return NextResponse.json(uniqueProfessions);
  } catch (error) {
    console.error("Error fetching professions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
