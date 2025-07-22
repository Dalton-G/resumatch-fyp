import z from "zod";

export const jobRecommendationSchema = z.object({
  jobId: z.string(),
  title: z.string(),
  company: z.string(),
  location: z.string(),
  workType: z.string(),
  salaryMin: z.number(),
  salaryMax: z.number(),
  matchScore: z.number().min(0).max(100),
  embeddingSimilarity: z.number().min(0).max(100),
  explanation: z.string(),
  keyStrengths: z.array(z.string()),
  potentialChallenges: z.array(z.string()),
});

export const jobMatchingResponseSchema = z.object({
  recommendations: z.array(jobRecommendationSchema),
  totalFound: z.number(),
  searchSummary: z.string(),
});

export type JobRecommendation = z.infer<typeof jobRecommendationSchema>;
export type JobMatchingResponse = z.infer<typeof jobMatchingResponseSchema>;
