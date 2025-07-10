import { v4 as uuidv4 } from "uuid";
import {
  PutObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client } from "../s3-client";
import { env } from "@/config/env";

// File category config for allowed types and sizes
export const FILE_CATEGORY_CONFIG = {
  "profile-picture": {
    allowedMime: /^image\/(jpeg|png|jpg|webp|gif)$/,
    allowedExtensions: ["jpg", "jpeg", "png", "webp", "gif"],
    maxSize: 5 * 1024 * 1024,
    folder: "profile-pictures",
  },
  resume: {
    allowedMime: /^application\/pdf$/,
    allowedExtensions: ["pdf"],
    maxSize: 10 * 1024 * 1024,
    folder: "resumes",
  },
  "job-image": {
    allowedMime: /^image\/(jpeg|png|jpg|webp|gif)$/,
    allowedExtensions: ["jpg", "jpeg", "png", "webp", "gif"],
    maxSize: 5 * 1024 * 1024,
    folder: "job-images",
  },
};

export interface UploadRequest {
  fileName: string;
  contentType: string;
  size: number;
  folderPath?: string;
}

export interface UploadResponse {
  presignedUrl: string;
  fileName: string; // Just the filename, not the full key
  fileUrl: string;
}

export interface FileInfo {
  key: string;
  fileName: string;
  fullKey: string;
  size: number;
  lastModified: Date | undefined;
  url: string;
}

export interface ListFilesResponse {
  files: FileInfo[];
}

function encodeS3Key(fileName: string, folderPath?: string): string {
  const encodedFileName = encodeURIComponent(fileName);
  if (folderPath) {
    const encodedFolderPath = folderPath
      .replace(/^\/+|\/+$/g, "")
      .split("/")
      .map(encodeURIComponent)
      .join("/");
    return `${encodedFolderPath}/${encodedFileName}`;
  }
  return encodedFileName;
}

function generateFileUrl(key: string): string {
  const bucketName = env.AWS_S3_BUCKET_NAME;
  const region = env.AWS_REGION;
  return `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;
}

export function constructS3Key(fileName: string, folderPath?: string): string {
  return encodeS3Key(fileName, folderPath);
}

export function constructFileUrl(
  fileName: string,
  folderPath?: string
): string {
  const key = encodeS3Key(fileName, folderPath);
  return generateFileUrl(key);
}

// Main service functions
export async function createUploadUrl(
  request: UploadRequest
): Promise<UploadResponse> {
  const { fileName, contentType, size, folderPath } = request;
  const uniqueFileName = `${uuidv4()}-${fileName}`;
  const s3Key = constructS3Key(uniqueFileName, folderPath);
  const command = new PutObjectCommand({
    Bucket: env.AWS_S3_BUCKET_NAME,
    Key: s3Key,
    ContentType: contentType,
    ContentLength: size,
  });
  const presignedUrl = await getSignedUrl(s3Client, command, {
    expiresIn: 300, // 5 minutes
  });
  const fileUrl = generateFileUrl(s3Key);
  return {
    presignedUrl,
    fileName: uniqueFileName,
    fileUrl,
  };
}

export async function listFiles(
  folderPath: string,
  allowedExtensions?: string[]
): Promise<ListFilesResponse> {
  // Ensure folder path ends with / for S3 listing
  const normalizedFolderPath = folderPath.endsWith("/")
    ? folderPath
    : `${folderPath}/`;
  const command = new ListObjectsV2Command({
    Bucket: env.AWS_S3_BUCKET_NAME,
    Prefix: normalizedFolderPath,
    MaxKeys: 1000,
  });
  const response = await s3Client.send(command);
  if (!response.Contents) {
    return { files: [] };
  }
  // Filter for allowed file extensions if provided
  const files = response.Contents.filter((obj) => {
    const key = obj.Key || "";
    const extension = key.toLowerCase().split(".").pop();
    if (!allowedExtensions) return true;
    return allowedExtensions.includes(extension || "");
  })
    .map((obj) => {
      const key = obj.Key || "";
      const fileName = key.split("/").pop() || "";
      // Extract original filename by removing UUID prefix
      const originalFileName = fileName.includes("-")
        ? fileName.split("-").slice(1).join("-")
        : fileName;
      return {
        key: key,
        fileName: originalFileName,
        fullKey: key,
        size: obj.Size || 0,
        lastModified: obj.LastModified,
        url: generateFileUrl(key),
      };
    })
    .sort((a, b) => {
      const dateA = a.lastModified ? new Date(a.lastModified).getTime() : 0;
      const dateB = b.lastModified ? new Date(b.lastModified).getTime() : 0;
      return dateB - dateA; // Sort by newest first
    });
  return { files };
}

export async function deleteFile(
  fileNameOrKey: string,
  folderPath?: string
): Promise<void> {
  const key = fileNameOrKey.includes("/")
    ? fileNameOrKey
    : constructS3Key(fileNameOrKey, folderPath);
  const command = new DeleteObjectCommand({
    Bucket: env.AWS_S3_BUCKET_NAME,
    Key: key,
  });
  await s3Client.send(command);
}
