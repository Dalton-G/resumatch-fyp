import z from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_APP_BASE_URL: z.string().trim().min(1),
  OPENAI_API_KEY: z.string().trim().min(1),
  OPENAI_EMBEDDING_MODEL: z.string().trim().min(1),
  OPENAI_LLM_MODEL: z.string().trim().min(1),
  PINECONE_API_KEY: z.string().trim().min(1),
  PINECONE_INDEX_NAME: z.string().trim().min(1),
});

export const env = envSchema.parse(process.env);
