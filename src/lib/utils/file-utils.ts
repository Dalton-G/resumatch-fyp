import { env } from "@/config/env";

export function constructFileUrl(fileName: string, folderPath: string): string {
  const bucketName = env.AWS_S3_BUCKET_NAME;
  const region = env.AWS_REGION;

  const encodedFolderPath = folderPath
    .replace(/^\/+|\/+$/g, "")
    .split("/")
    .map(encodeURIComponent)
    .join("/");

  const encodedFileName = encodeURIComponent(fileName);

  const key = `${encodedFolderPath}/${encodedFileName}`;
  const url = `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;

  return url;
}
