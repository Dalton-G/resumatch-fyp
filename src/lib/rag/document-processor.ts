import { JobPosting } from "@prisma/client";
import { JobPostingMetadata, ResumeMetadata } from "../model/chunk-metadata";
import { env } from "@/config/env";

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

export function prepareJobPostingContent(jobPosting: JobPosting): string {
  const { title, description, location, salaryMin, salaryMax, workType } =
    jobPosting;
  return `
  Title: ${title}.
  Description: ${description}.
  Location: ${location}.
  Salary: ${salaryMin} - ${salaryMax}.
  Work Type: ${workType}.
  `;
}

export function constructJobPostingUrl(jobId: string): string {
  return `${env.NEXT_PUBLIC_APP_BASE_URL}/jobs/${jobId}`;
}

export function prepareJobPostingMetadata(
  content: string,
  companyId: string,
  jobId: string,
  source: string,
  active: boolean = true
): JobPostingMetadata {
  return {
    content: cleanText(content),
    metadata: {
      companyId,
      jobId,
      source,
      active,
    },
  };
}
