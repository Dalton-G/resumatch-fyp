import { NextRequest, NextResponse } from "next/server";
import { streamText } from "ai";
import { env } from "@/config/env";
import { openai } from "@ai-sdk/openai";

export async function POST(req: NextRequest) {
  try {
    const { messages, resumeContext } = await req.json();

    const systemPrompt = `
        You are ResuMatch AI, an expert resume consultant and career advisor. You will help users understand, improve, and discuss their resume.
        RESUME CONTEXT:
        ${resumeContext || "No resume content available yet."}
        GUIDELINES:
        - Answer questions based primarily on the provided context
        - If the context doesn't contain enough information to answer a question, say so politely
        - Be conversational but professional
        - Focus on relevant details from the resume
        - If asked about skills, experience, or background, reference specific information from the context
        - Don't make up information that's not in the context
        - If the user asks topics that are not related to the resume, politely redirect them to focus on the resume content

        Always ground your responses in the actual resume content provided above.
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
    console.error("Error in chat API:", error);
    return NextResponse.json("Internal server error", { status: 500 });
  }
}
