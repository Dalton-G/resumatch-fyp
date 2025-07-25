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
      active: { $eq: true }, // Only include active resume embeddings (not banned users)
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

        // Use the same system + user prompt structure as job-matching
        const systemPrompt = `
          You are ResuMatch AI, an expert candidate ranking system that analyzes resumes against job requirements to provide detailed candidate assessments.
          
          TASK: Analyze the provided candidate's resume for the specific job position and provide a comprehensive evaluation.
          
          For this candidate, provide:
          1. An AI match score (0-100) based on how well the candidate's skills and experience align with the job requirements
          2. Detailed reasoning explaining why this candidate matches or doesn't match the role
          3. Key strengths the candidate has for this role (3-5 specific skills or experiences)
          4. Potential concerns or gaps that might need attention (can be empty if none)
          
          GUIDELINES:
          - Base AI scores on actual skill alignment, experience level, and job requirements
          - Be specific in analysis - mention actual skills, technologies, or experiences
          - Focus on actionable insights for recruiters
          - Be honest about both strengths and potential gaps
          - Consider technical competency, experience level, and cultural fit
          - Use objective language when analyzing candidate strengths and concerns
        `;

        const userPrompt = `
          JOB POSITION:
          Title: ${jobPosting.title}
          Company: ${jobPosting.company.name}
          Description: ${jobPosting.description}
          
          CANDIDATE RESUME:
          ${candidate.resumeContent}
          
          Please analyze this candidate's fit for the job position and provide a detailed assessment.
          Focus on specific skills, experiences, and qualifications that are relevant to the role.
        `;

        const { object: analysis } = await generateObject({
          model: openai(env.OPENAI_LLM_MODEL),
          system: systemPrompt,
          prompt: userPrompt,
          schema: candidateAnalysisSchema,
          temperature: 0.3,
          maxTokens: 2000,
        });

        return {
          jobSeekerId: candidate.jobSeekerId,
          applicationId: candidate.applicationId,
          name: candidate.name,
          aiScore: analysis.aiScore / 100, // Convert to 0-1 scale to match existing format
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
      totalCandidates: limitedCandidates.length,
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
