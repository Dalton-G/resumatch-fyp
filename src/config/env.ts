import z from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_APP_BASE_URL: z.string().trim().min(1),
  OPENAI_API_KEY: z.string().trim().min(1),
  OPENAI_EMBEDDING_MODEL: z.string().trim().min(1),
  OPENAI_LLM_MODEL: z.string().trim().min(1),
  PINECONE_API_KEY: z.string().trim().min(1),
  PINECONE_INDEX_NAME: z.string().trim().min(1),
  PINECONE_RESUME_NAMESPACE: z.string().trim().min(1),
  PINECONE_JOB_NAMESPACE: z.string().trim().min(1),
  AWS_ACCESS_KEY_ID: z.string().trim().min(1),
  AWS_SECRET_ACCESS_KEY: z.string().trim().min(1),
  AWS_REGION: z.string().trim().min(1),
  AWS_S3_BUCKET_NAME: z.string().trim().min(1),
});

export const env = envSchema.parse(process.env);
