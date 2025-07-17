import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { jobPostingSchema } from "@/schema/job-posting-schema";

export async function POST(request: NextRequest) {
  // Authenticate user
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Parse and validate body
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const validation = jobPostingSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(
      { error: validation.error.format() },
      { status: 400 }
    );
  }

  // Find the company profile for the current user
  const companyProfile = await prisma.companyProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!companyProfile) {
    return NextResponse.json(
      { error: "Company profile not found for user." },
      { status: 404 }
    );
  }

  const {
    title,
    description,
    location,
    workType,
    status,
    salaryMin,
    salaryMax,
  } = validation.data;

  try {
    const jobPosting = await prisma.jobPosting.create({
      data: {
        title,
        description,
        location,
        workType,
        status,
        salaryMin,
        salaryMax,
        companyId: companyProfile.id,
      },
    });
    return NextResponse.json(jobPosting, { status: 201 });
  } catch (error) {
    console.error("Error creating job posting:", error);
    return NextResponse.json(
      { error: "Failed to create job posting" },
      { status: 500 }
    );
  }
}
