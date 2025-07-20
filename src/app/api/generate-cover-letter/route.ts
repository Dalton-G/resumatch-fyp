import { env } from "@/config/env";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate the user
    const session = await auth();
    if (!session?.user || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // 2. Validate the request body
    const { jobId, resumeId } = await req.json();
    if (!jobId || !resumeId) {
      return NextResponse.json(
        { message: "Job ID and Resume ID are required" },
        { status: 400 }
      );
    }

    // 3. Fetch job details
    const jobDetails = await prisma.jobPosting.findUnique({
      where: { id: jobId },
      include: { company: true },
    });

    if (!jobDetails) {
      return NextResponse.json({ message: "Job not found" }, { status: 404 });
    }

    // 4. Fetch resume details
    const resumeDetails = await prisma.resume.findUnique({
      where: { id: resumeId },
      include: {
        embedding: true,
        jobSeeker: true,
      },
    });

    if (
      !resumeDetails ||
      !resumeDetails.embedding ||
      !resumeDetails.jobSeeker
    ) {
      return NextResponse.json(
        { message: "Resume, Embedding, or Job Seeker not found" },
        { status: 404 }
      );
    }

    // 5. Extract Text from Resume
    const resumeText = resumeDetails.embedding.content;

    // 6. Prepare the system prompt for the AI model
    const systemPrompt = `
        You are a professional career counselor helping job seekers write compelling cover letters. 
        Create a personalized, professional cover letter that:
        - Highlights relevant experience from the candidate's resume
        - Shows genuine interest in the specific role and company
        - Demonstrates how the candidate's skills align with job requirements
        - Maintains a professional yet engaging tone
        - Is approximately 3-4 paragraphs long
        - Avoids generic phrases and focuses on specific value proposition
    `;

    // 7. Prepare the user prompt with job and resume details
    const userPrompt = `
        Write a cover letter for the following job application:
        JOB DETAILS:
        Position: ${jobDetails.title}
        Company: ${jobDetails.company.name}
        Job Description: ${jobDetails.description}

        CANDIDATE'S DETAILS:
        Name: ${resumeDetails.jobSeeker.firstName} ${resumeDetails.jobSeeker.lastName}
        Resume: ${resumeText}

        Please write a personalized cover letter that connects the candidate's experience to this specific role and company.
    `;

    // 8. Generate the cover letter using OpenAI
    const { text } = await generateText({
      model: openai(env.OPENAI_LLM_MODEL),
      system: systemPrompt,
      prompt: userPrompt,
      temperature: 0.7,
      maxTokens: 800,
    });

    // 9. Return the generated cover letter
    return NextResponse.json({ coverLetter: text }, { status: 200 });
  } catch (error) {
    console.error("Error in generate cover letter route:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
