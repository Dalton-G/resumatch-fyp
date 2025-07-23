import { z } from "zod";

export const rankApplicantsRequestSchema = z.object({
  jobId: z.string().min(1, "Job selection is required"),
  amount: z.number().min(1).max(5),
  localOnly: z.boolean().optional(),
  profession: z.string().optional(),
});

export const candidateAnalysisSchema = z.object({
  aiScore: z
    .number()
    .min(0)
    .max(100)
    .describe(
      "AI-generated match score (0-100) based on candidate fit for the role"
    ),
  reasoning: z
    .string()
    .describe(
      "Detailed analysis of why this candidate matches the job requirements"
    ),
  keyStrengths: z
    .array(z.string())
    .describe("3-5 key strengths of this candidate for this role"),
  potentialConcerns: z
    .array(z.string())
    .describe("Any potential concerns or gaps (can be empty array)"),
});

export const rankedCandidateSchema = z.object({
  jobSeekerId: z.string(),
  applicationId: z.string(),
  name: z.string(),
  aiScore: z.number(),
  embeddingScore: z.number(),
  profession: z.string().nullable(),
  country: z.string().nullable(),
  profilePicture: z.string().nullable(),
  analysis: candidateAnalysisSchema,
});

export const rankApplicantsResponseSchema = z.object({
  jobTitle: z.string(),
  jobCompany: z.string(),
  totalCandidates: z.number(),
  candidates: z.array(rankedCandidateSchema),
});

export type RankApplicantsRequest = z.infer<typeof rankApplicantsRequestSchema>;
export type CandidateAnalysis = z.infer<typeof candidateAnalysisSchema>;
export type RankedCandidate = z.infer<typeof rankedCandidateSchema>;
export type RankApplicantsResponse = z.infer<
  typeof rankApplicantsResponseSchema
>;
