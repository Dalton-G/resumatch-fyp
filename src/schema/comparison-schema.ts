import z from "zod";

export const comparisonSchema = z.object({
  matchScore: z.number().min(0).max(100),
  matchFeedback: z.string(),
  matchingKeywords: z.array(z.string()),
  missingKeywords: z.array(z.string()),
  recommendations: z.array(z.string()),
});
