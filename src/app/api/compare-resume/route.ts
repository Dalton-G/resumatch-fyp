import { env } from "@/config/env";
import { cleanResumeText } from "@/lib/utils/clean-resume-text";
import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const comparisonSchema = z.object({
  matchScore: z.number().min(0).max(100),
  matchFeedback: z.string(),
  matchingKeywords: z.array(z.string()),
  missingKeywords: z.array(z.string()),
  recommendations: z.array(z.string()),
});

export async function POST(req: NextRequest) {
  try {
    const { resumeContext, jobDescription } = await req.json();
    const cleanedResumeText = cleanResumeText(resumeContext);
    const cleanedJobDescription = cleanResumeText(jobDescription);
    const systemPrompt = `
            You are an expert ATS (Applicant Tracking System) analyzer and career coach called ResuMatch AI. 
            
            Compare the resume against the provided job description and provide:
            1. A match score (0-100) based on how well the resume aligns with the job requirements
            2. Keywords that match between the resume and job description
            3. Important keywords missing from the resume
            4. Specific recommendations to improve the match
            
            Focus on:
            - Technical skills and tools mentioned
            - Years of experience requirements
            - Education and certifications
            - Industry-specific terminology
            - Soft skills and competencies
            
            Be realistic and helpful in your analysis.
        `;
    const result = await generateObject({
      model: openai(env.OPENAI_LLM_MODEL),
      system: systemPrompt,
      schema: comparisonSchema,
      prompt: `
                Analyze how well this resume "${cleanedResumeText}" matches the following job description:
    
                JOB DESCRIPTION:
                ${cleanedJobDescription}
    
                You must provide a realistic analysis based on common resume elements and the job requirements. 
                Extract key requirements from the job description and provide meaningful feedback.
            `,
    });
    return NextResponse.json(result.object);
  } catch (error) {
    console.error("Error in compare-resume API:", error);
    return NextResponse.json("Internal server error", { status: 500 });
  }
}
