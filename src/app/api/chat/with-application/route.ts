import { NextRequest, NextResponse } from "next/server";
import { streamText } from "ai";
import { env } from "@/config/env";
import { openai } from "@ai-sdk/openai";

export async function POST(req: NextRequest) {
  try {
    const { messages, resumeContent, jobDescription, candidateName } =
      await req.json();

    const systemPrompt = `
        You are ResuMatch AI, a helpful and conversational assistant for recruiters analyzing job applications. 
        Your goal is to help recruiters understand candidates better and make informed hiring decisions.

        CONTEXT:
        Candidate: ${candidateName || "Unknown Candidate"}
        
        RESUME CONTENT:
        ${resumeContent || "No resume content available."}
        
        JOB DESCRIPTION:
        ${jobDescription || "No job description available."}

        CAPABILITIES:
        You can help recruiters with:
        1. Summarizing the candidate's background and experience
        2. Identifying strengths and potential gaps in skills/experience
        3. Generating relevant interview questions
        4. Comparing candidate qualifications with job requirements
        5. Providing insights about the candidate's career progression
        6. Suggesting areas to explore during interviews

        TONE & STYLE:
        - Be conversational but professional
        - Provide specific, actionable insights
        - Reference actual details from the resume and job description
        - Be honest about both strengths and potential concerns
        - Offer practical recommendations

        GUIDELINES:
        - Always base your responses on the provided resume and job description
        - If information is missing, acknowledge it clearly
        - When generating interview questions, make them relevant and specific
        - Focus on helping the recruiter make better hiring decisions
        - Keep responses concise but comprehensive
    `;

    const result = streamText({
      model: openai(env.OPENAI_LLM_MODEL),
      system: systemPrompt,
      messages: messages,
      temperature: 0.7,
      maxTokens: 1000,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Error in application chat API:", error);
    return NextResponse.json("Internal server error", { status: 500 });
  }
}
