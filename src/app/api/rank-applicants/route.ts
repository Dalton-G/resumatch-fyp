import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";
import pc from "@/lib/pinecone";
import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { generateEmbedding } from "@/lib/rag/embedding-service";
import { env } from "@/config/env";
import {
  rankApplicantsRequestSchema,
  candidateAnalysisSchema,
  type RankedCandidate,
} from "@/schema/rank-applicants-schema";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== UserRole.COMPANY) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const {
      jobId,
      amount = 3,
      localOnly,
      profession,
    } = rankApplicantsRequestSchema.parse(body);

    // Get the company profile to get the actual company ID
    const companyProfile = await prisma.companyProfile.findUnique({
      where: {
        userId: session.user.id,
      },
      select: {
        id: true,
      },
    });

    if (!companyProfile) {
      return NextResponse.json(
        { error: "Company profile not found" },
        { status: 404 }
      );
    }

    // Get the job posting with company verification
    const jobPosting = await prisma.jobPosting.findFirst({
      where: {
        id: jobId,
        companyId: companyProfile.id,
      },
      select: {
        id: true,
        title: true,
        description: true,
        company: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!jobPosting) {
      return NextResponse.json(
        { error: "Job posting not found" },
        { status: 404 }
      );
    }

    // Get job applications for this job
    const applications = await prisma.jobApplication.findMany({
      where: {
        jobId: jobId,
      },
      select: {
        id: true,
        jobSeekerId: true,
      },
    });

    if (applications.length === 0) {
      return NextResponse.json({
        jobTitle: jobPosting.title,
        jobCompany: jobPosting.company.name,
        totalCandidates: 0,
        candidates: [],
      });
    }

    const appliedJobSeekerProfileIds = applications.map(
      (app) => app.jobSeekerId
    );

    // Create mapping from jobSeekerId to application ID
    const jobSeekerToApplicationMap = new Map(
      applications.map((app) => [app.jobSeekerId, app.id])
    );

    // IMPORTANT: Confusing naming convention here!
    // - JobApplication.jobSeekerId = JobSeekerProfile.id
    // - ResumeEmbedding.jobSeekerId & Pinecone metadata = User.id
    // So we need to map JobSeekerProfile.id -> User.id for Pinecone filtering
    const jobSeekerProfiles = await prisma.jobSeekerProfile.findMany({
      where: {
        id: { in: appliedJobSeekerProfileIds },
      },
      select: {
        id: true,
        userId: true,
      },
    });

    // Create mapping from userId to application ID
    const userToApplicationMap = new Map(
      jobSeekerProfiles.map((profile) => [
        profile.userId,
        jobSeekerToApplicationMap.get(profile.id),
      ])
    );

    const appliedUserIds = jobSeekerProfiles.map((profile) => profile.userId);

    if (appliedUserIds.length === 0) {
      return NextResponse.json({
        jobTitle: jobPosting.title,
        jobCompany: jobPosting.company.name,
        totalCandidates: 0,
        candidates: [],
      });
    }

    // Create job embedding for similarity search
    const jobText = `${jobPosting.title}\n${jobPosting.description}`;
    const jobEmbedding = await generateEmbedding(jobText);

    // Build Pinecone filter (using User IDs, not JobSeekerProfile IDs)
    const pineconeFilter: Record<string, any> = {
      jobSeekerId: { $in: appliedUserIds }, // This should be User.id values
    };

    if (localOnly) {
      // Filter for local candidates - assuming this means country matches job posting
      const jobCountry = await prisma.jobPosting.findUnique({
        where: { id: jobId },
        select: { country: true },
      });
      if (jobCountry) {
        pineconeFilter.country = jobCountry.country;
      }
    }

    if (profession) {
      pineconeFilter.profession = profession;
    }

    // Query Pinecone for candidate resumes
    const index = pc.index(env.PINECONE_INDEX_NAME);
    const namespace = index.namespace(env.PINECONE_RESUME_NAMESPACE);

    const queryResult = await namespace.query({
      vector: jobEmbedding,
      topK: 50, // Get more candidates to ensure we have enough after filtering
      filter: pineconeFilter,
      includeMetadata: true,
    });

    if (!queryResult.matches || queryResult.matches.length === 0) {
      return NextResponse.json({
        jobTitle: jobPosting.title,
        jobCompany: jobPosting.company.name,
        totalCandidates: 0,
        candidates: [],
      });
    }

    // Get candidate profiles with resume content
    const candidateData = await Promise.all(
      queryResult.matches.map(async (match: any) => {
        const jobSeekerId = match.metadata?.jobSeekerId as string;
        const embeddingScore = match.score || 0;

        // Get the resume content from the embedding record
        const resumeEmbedding = await prisma.resumeEmbedding.findFirst({
          where: { jobSeekerId },
          select: {
            content: true,
          },
        });

        const profile = await prisma.jobSeekerProfile.findUnique({
          where: { userId: jobSeekerId },
          select: {
            user: {
              select: {
                name: true,
              },
            },
            profession: true,
            country: true,
            profilePicture: true,
          },
        });

        if (!profile || !resumeEmbedding) {
          return null;
        }

        return {
          jobSeekerId,
          applicationId: userToApplicationMap.get(jobSeekerId),
          name: profile.user.name || "Unknown",
          profession: profile.profession,
          country: profile.country,
          profilePicture: profile.profilePicture,
          resumeContent: resumeEmbedding.content,
          embeddingScore,
        };
      })
    );

    const validCandidates = candidateData.filter(Boolean);

    if (validCandidates.length === 0) {
      return NextResponse.json({
        jobTitle: jobPosting.title,
        jobCompany: jobPosting.company.name,
        totalCandidates: 0,
        candidates: [],
      });
    }

    // Analyze candidates with AI and generate scores
    const rankedCandidates: RankedCandidate[] = await Promise.all(
      validCandidates.map(async (candidate: any) => {
        if (!candidate) throw new Error("Invalid candidate data");

        const analysisPrompt = `
Analyze this candidate's resume for the following job position:

JOB: ${jobPosting.title} at ${jobPosting.company.name}
DESCRIPTION: ${jobPosting.description}

CANDIDATE RESUME:
${candidate.resumeContent}

Provide a detailed analysis of this candidate's fit for the role.
`;

        const { object: analysis } = await generateObject({
          model: openai("gpt-4o"),
          schema: candidateAnalysisSchema,
          prompt: analysisPrompt,
        });

        // Calculate AI score based on overall fit
        const aiScore = (() => {
          switch (analysis.overallFit) {
            case "EXCELLENT":
              return 0.95;
            case "GOOD":
              return 0.8;
            case "FAIR":
              return 0.6;
            case "POOR":
              return 0.3;
            default:
              return 0.5;
          }
        })();

        return {
          jobSeekerId: candidate.jobSeekerId,
          applicationId: candidate.applicationId,
          name: candidate.name,
          aiScore,
          embeddingScore: candidate.embeddingScore,
          profession: candidate.profession,
          country: candidate.country,
          profilePicture: candidate.profilePicture,
          analysis,
        };
      })
    );

    // Sort by AI score (primary) then embedding score (secondary)
    rankedCandidates.sort((a, b) => {
      if (b.aiScore !== a.aiScore) {
        return b.aiScore - a.aiScore;
      }
      return b.embeddingScore - a.embeddingScore;
    });

    // Limit to requested amount
    const limitedCandidates = rankedCandidates.slice(0, amount);

    return NextResponse.json({
      jobTitle: jobPosting.title,
      jobCompany: jobPosting.company.name,
      totalCandidates: rankedCandidates.length,
      candidates: limitedCandidates,
    });
  } catch (error) {
    console.error("Error in rank applicants API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
