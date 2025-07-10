import { NextResponse } from "next/server";
import { z } from "zod";
import {
  createUploadUrl,
  listFiles,
  deleteFile,
  FILE_CATEGORY_CONFIG,
} from "@/lib/utils/s3-utils";

const uploadRequestSchema = z.object({
  fileName: z.string().min(1, "File name is required"),
  contentType: z.string().min(1, "Content type is required"),
  size: z.number().positive("File size must be positive"),
  folderPath: z.string().optional(),
  fileCategory: z.enum(["profile-picture", "resume", "job-image"]),
});

const readRequestSchema = z.object({
  folderPath: z.string(),
  fileCategory: z.enum(["profile-picture", "resume", "job-image"]).optional(),
});

const deleteRequestSchema = z.object({
  key: z.string(),
  folderPath: z.string().optional(),
});

// POST - Create presigned URL for upload
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = uploadRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { fileName, contentType, size, folderPath, fileCategory } =
      validation.data;
    const config = FILE_CATEGORY_CONFIG[fileCategory];
    if (!config) {
      return NextResponse.json(
        { error: "Invalid file category" },
        { status: 400 }
      );
    }
    // Validate mime type
    if (!config.allowedMime.test(contentType)) {
      return NextResponse.json(
        {
          error: `Invalid file type. Allowed: ${config.allowedExtensions.join(
            ", "
          )}`,
        },
        { status: 400 }
      );
    }
    // Validate size
    if (size > config.maxSize) {
      return NextResponse.json(
        {
          error: `File size exceeds limit (${
            config.maxSize / (1024 * 1024)
          }MB)`,
        },
        { status: 400 }
      );
    }
    // Use default folder if not provided
    const uploadResponse = await createUploadUrl({
      fileName,
      contentType,
      size,
      folderPath: folderPath || config.folder,
    });
    return NextResponse.json(uploadResponse, { status: 200 });
  } catch (error) {
    console.error("Error creating presigned URL:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// GET - List files in folder
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const folderPath = searchParams.get("folderPath");
    const fileCategory = searchParams.get("fileCategory") as
      | "profile-picture"
      | "resume"
      | "job-image"
      | undefined;

    if (!folderPath) {
      return NextResponse.json(
        { error: "Folder path is required" },
        { status: 400 }
      );
    }

    // Use config for allowedExtensions if fileCategory is provided
    let allowedExtensions: string[] | undefined = undefined;
    if (fileCategory && FILE_CATEGORY_CONFIG[fileCategory]) {
      allowedExtensions = FILE_CATEGORY_CONFIG[fileCategory].allowedExtensions;
    }

    const filesResponse = await listFiles(folderPath, allowedExtensions);
    return NextResponse.json(filesResponse, { status: 200 });
  } catch (error) {
    console.error("Error reading S3 objects:", error);
    return NextResponse.json(
      {
        error: "Failed to read files from S3",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete file
export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const validation = deleteRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid request body - key is required",
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const { key, folderPath } = validation.data;
    await deleteFile(key, folderPath);

    return NextResponse.json(
      { message: "File deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting S3 object:", error);
    return NextResponse.json(
      {
        error: "Failed to delete file",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
