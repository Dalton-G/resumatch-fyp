import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { env } from "@/config/env";
import { generateEmbedding } from "@/lib/rag/embedding-service";
import { searchSimilarJobs } from "@/lib/utils/job-search-operation";
import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { jobMatchingResponseSchema } from "@/schema/job-matching-schema";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Not authorized" }, { status: 401 });
    }

    const { resumeId, filters } = await request.json();

    if (!resumeId) {
      return NextResponse.json(
        { error: "Resume ID is required" },
        { status: 400 }
      );
    }

    // 1. Get the resume details and check ownership
    const resume = await prisma.resume.findFirst({
      where: {
        id: resumeId,
        jobSeeker: {
          userId: session.user.id,
        },
      },
      include: {
        embedding: true,
        jobSeeker: true,
      },
    });

    if (!resume || !resume.embedding) {
      return NextResponse.json(
        { error: "Resume or embedding not found" },
        { status: 404 }
      );
    }

    // 2. Generate embedding from resume content for similarity search
    const resumeEmbedding = await generateEmbedding(resume.embedding.content);

    // 3. Get applied job IDs first for Pinecone filtering
    const appliedJobIds = await prisma.jobApplication
      .findMany({
        where: {
          resumeId: resumeId,
        },
        select: {
          jobId: true,
        },
      })
      .then((applications) => applications.map((app) => app.jobId));

    // 4. Query Pinecone for similar job postings (excluding applied jobs)
    const queryResponse = await searchSimilarJobs(
      resumeEmbedding,
      {
        salaryMin: filters.salaryMin,
        salaryMax: filters.salaryMax,
        position: filters.position,
        workType: filters.workType,
        country: filters.country,
        appliedJobIds: appliedJobIds,
      },
      filters.amount || 5
    );

    if (!queryResponse.matches || queryResponse.matches.length === 0) {
      return NextResponse.json({
        recommendations: [],
        totalFound: 0,
        searchSummary: "No matching jobs found with the specified criteria.",
      });
    }

    // 5. Get detailed job information from database
    const jobIds = queryResponse.matches
      .map((match: any) => match.metadata?.jobId)
      .filter(Boolean) as string[];

    const jobPostings = await prisma.jobPosting.findMany({
      where: {
        id: { in: jobIds },
        status: { notIn: ["CLOSED", "CLOSED_BY_ADMIN"] },
      },
      include: {
        company: {
          select: {
            name: true,
          },
        },
      },
    });

    // 6. Combine Pinecone results with database data
    const jobsWithScores = queryResponse.matches
      .map((match: any) => {
        const job = jobPostings.find((j) => j.id === match.metadata?.jobId);
        if (!job) return null;

        return {
          ...job,
          similarityScore: match.score || 0,
          jobDescription: match.metadata?.content || job.description,
        };
      })
      .filter((job: any): job is NonNullable<typeof job> => job !== null);

    if (jobsWithScores.length === 0) {
      return NextResponse.json({
        recommendations: [],
        totalFound: 0,
        searchSummary: "No valid job matches found.",
      });
    }

    // 7. Use LLM to analyze matches and generate recommendations
    const systemPrompt = `
      You are ResuMatch AI, an expert job matching system that analyzes resumes and job postings to provide personalized recommendations.
      
      TASK: Analyze the provided resume content and job postings to generate detailed job recommendations.
      
      For each job posting, provide:
      1. A match score (0-100) based on how well the candidate's skills and experience align with the job requirements
      2. A clear explanation of why this job is a good match
      3. Key strengths the candidate has for this role (3-5 specific skills or experiences)
      4. Potential challenges or areas to highlight in applications (2-3 areas)
      
      GUIDELINES:
      - Base match scores on actual skill alignment, experience level, and job requirements
      - Be specific in explanations - mention actual skills, technologies, or experiences
      - Focus on actionable insights for the job seeker
      - Be honest about both strengths and potential gaps
      - Consider career progression and growth opportunities
    `;

    const userPrompt = `
      RESUME CONTENT:
      ${resume.embedding.content}
      
      JOB POSTINGS TO ANALYZE:
      ${jobsWithScores
        .map(
          (job, index) => `
        Job ${index + 1}:
        ID: ${job.id}
        Title: ${job.title}
        Company: ${job.company.name}
        Location: ${job.country}
        Work Type: ${job.workType}
        Salary: $${job.salaryMin} - $${job.salaryMax}
        Description: ${job.jobDescription}
        Similarity Score: ${(job.similarityScore * 100).toFixed(1)}%
        ---
      `
        )
        .join("\n")}
      
      Please analyze each job and provide detailed recommendations based on the resume content.
    `;

    const result = await generateObject({
      model: openai(env.OPENAI_LLM_MODEL),
      system: systemPrompt,
      prompt: userPrompt,
      schema: jobMatchingResponseSchema,
      temperature: 0.3,
      maxTokens: 2000,
    });

    return NextResponse.json(result.object);
  } catch (error) {
    console.error("Error in job matching API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
