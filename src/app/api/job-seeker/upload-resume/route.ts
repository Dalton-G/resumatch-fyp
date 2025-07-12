import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { deleteFile as s3DeleteFile } from "@/lib/utils/s3-utils";
import { FILE_CATEGORY_CONFIG } from "@/config/file-category-config";

// GET: List all resumes for the current job seeker
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }
  const userId = session.user.id;
  // Find job seeker profile
  const jobSeeker = await prisma.jobSeekerProfile.findUnique({
    where: { userId },
    include: { resumes: true },
  });
  if (!jobSeeker) {
    return NextResponse.json(
      { error: "Job seeker profile not found" },
      { status: 404 }
    );
  }
  return NextResponse.json({ resumes: jobSeeker.resumes }, { status: 200 });
}

// POST: Create a new resume record after S3 upload
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }
  const userId = session.user.id;
  const jobSeeker = await prisma.jobSeekerProfile.findUnique({
    where: { userId },
  });
  if (!jobSeeker) {
    return NextResponse.json(
      { error: "Job seeker profile not found" },
      { status: 404 }
    );
  }
  const body = await request.json();
  const { fileName, s3Url, fileSize } = body;
  if (!fileName || !s3Url || !fileSize) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }
  const resume = await prisma.resume.create({
    data: {
      jobSeekerId: jobSeeker.id,
      fileName,
      s3Url,
      fileSize,
    },
  });
  return NextResponse.json({ resume }, { status: 201 });
}

// DELETE: Delete a resume and its S3 file
export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }
  const userId = session.user.id;
  const body = await request.json();
  const { resumeId } = body;
  if (!resumeId) {
    return NextResponse.json({ error: "Missing resumeId" }, { status: 400 });
  }
  // Find the resume and check ownership
  const resume = await prisma.resume.findUnique({ where: { id: resumeId } });
  if (!resume) {
    return NextResponse.json({ error: "Resume not found" }, { status: 404 });
  }
  // Check that the resume belongs to the current user
  const jobSeeker = await prisma.jobSeekerProfile.findUnique({
    where: { userId },
  });
  if (!jobSeeker || resume.jobSeekerId !== jobSeeker.id) {
    return NextResponse.json(
      { error: "Not authorized to delete this resume" },
      { status: 403 }
    );
  }
  // Delete from S3
  await s3DeleteFile(resume.fileName, FILE_CATEGORY_CONFIG["resume"].folder);
  // Delete from DB (cascades to ResumeChunk)
  await prisma.resume.delete({ where: { id: resumeId } });
  return NextResponse.json({ message: "Resume deleted" }, { status: 200 });
}
