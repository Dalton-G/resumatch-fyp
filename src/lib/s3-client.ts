// NOTE: Do not import this file in client components. This is server-only code.
import { S3Client, S3ClientConfig } from "@aws-sdk/client-s3";
import { env } from "@/config/env";

const s3ClientConfig: S3ClientConfig = {
  region: env.AWS_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
};

export const s3Client = new S3Client(s3ClientConfig);
