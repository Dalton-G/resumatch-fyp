import { ResumeMetadata } from "../model/chunk-metadata";

export function cleanText(text: string): string {
  // Clean and normalize the text
  return text
    .replace(/\s+/g, " ") // Replace multiple whitespace with single space
    .replace(/\n\s*\n/g, "\n") // Remove excessive line breaks
    .trim();
}

export function prepareResumeMetadata(
  content: string,
  jobSeekerId: string,
  resumeId: string,
  source: string
): ResumeMetadata {
  return {
    content: cleanText(content),
    metadata: {
      jobSeekerId,
      resumeId,
      source,
      appliedJobIds: [],
    },
  };
}
