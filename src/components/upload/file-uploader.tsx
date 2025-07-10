"use client";

import { useCallback, useState } from "react";
import { FileRejection, useDropzone } from "react-dropzone";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { Loader2, Trash2, User, FileText } from "lucide-react";

export type UploadFile = {
  id: string;
  file: File;
  uploading: boolean;
  progress: number;
  fileName?: string;
  isDeleting: boolean;
  error: boolean;
  objectUrl?: string;
};

export interface FileUploaderProps {
  allowedExtensions: string[];
  maxSize: number;
  folderPath: string;
  fileCategory: "profile-picture" | "resume" | "job-image";
  label?: string;
  multiple?: boolean;
  onUploadComplete?: (fileName: string) => void;
}

export default function FileUploader({
  allowedExtensions,
  maxSize,
  folderPath,
  fileCategory,
  label = "Upload file",
  multiple = false,
  onUploadComplete,
}: FileUploaderProps) {
  const [files, setFiles] = useState<UploadFile[]>([]);

  async function removeFile(fileId: string) {
    setFiles((prev) =>
      prev.map((f) => (f.id === fileId ? { ...f, isDeleting: true } : f))
    );
    const file = files.find((f) => f.id === fileId);
    if (!file) return;
    try {
      if (file.objectUrl) {
        URL.revokeObjectURL(file.objectUrl);
      }
      const deleteFileResponse = await fetch("/api/s3", {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          key: file.fileName,
          folderPath: folderPath,
        }),
      });
      if (!deleteFileResponse.ok) {
        toast.error("Failed to delete file");
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileId ? { ...f, isDeleting: false, error: true } : f
          )
        );
        return;
      }
      toast.success("File removed");
      setFiles((prev) => prev.filter((f) => f.id !== fileId));
    } catch (error) {
      toast.error("Failed to delete file");
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileId ? { ...f, isDeleting: false, error: true } : f
        )
      );
    }
  }

  async function uploadFile(uploadFile: File) {
    const id = uuidv4();
    setFiles((prev) => [
      ...(!multiple ? [] : prev),
      {
        id,
        file: uploadFile,
        uploading: true,
        progress: 0,
        isDeleting: false,
        error: false,
        objectUrl: uploadFile.type.startsWith("image/")
          ? URL.createObjectURL(uploadFile)
          : undefined,
      },
    ]);
    try {
      const presignedUrlResponse = await fetch("/api/s3", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          fileName: uploadFile.name,
          contentType: uploadFile.type,
          size: uploadFile.size,
          folderPath: folderPath,
          fileCategory,
        }),
      });
      if (!presignedUrlResponse.ok) {
        toast.error("Failed to get presigned URL");
        setFiles((prev) =>
          prev.map((f) =>
            f.id === id
              ? { ...f, uploading: false, progress: 0, error: true }
              : f
          )
        );
        return;
      }
      const { presignedUrl, fileName } = await presignedUrlResponse.json();
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentageCompleted = (event.loaded / event.total) * 100;
            setFiles((prev) =>
              prev.map((f) =>
                f.id === id
                  ? {
                      ...f,
                      progress: Math.round(percentageCompleted),
                      fileName,
                    }
                  : f
              )
            );
          }
        };
        xhr.onload = () => {
          if (xhr.status === 200 || xhr.status === 204) {
            setFiles((prev) =>
              prev.map((f) =>
                f.id === id
                  ? { ...f, progress: 100, uploading: false, error: false }
                  : f
              )
            );
            toast.success("File uploaded successfully");
            if (onUploadComplete && fileName) {
              onUploadComplete(fileName);
            }
            resolve();
          } else {
            reject(new Error(`Failed to upload file: ${xhr.status}`));
          }
        };
        xhr.onerror = () => {
          reject(new Error(`Upload failed: ${xhr.status}`));
        };
        xhr.open("PUT", presignedUrl);
        xhr.setRequestHeader("Content-Type", uploadFile.type);
        xhr.send(uploadFile);
      });
    } catch (error) {
      toast.error("Failed to upload file");
      setFiles((prev) =>
        prev.map((f) =>
          f.id === id ? { ...f, uploading: false, progress: 0, error: true } : f
        )
      );
    }
  }

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        acceptedFiles.forEach((file) => uploadFile(file));
      }
    },
    [multiple]
  );

  const onDropRejected = useCallback(
    (fileRejections: FileRejection[]) => {
      if (fileRejections.length === 0) return;
      const errorMessages = {
        "too-many-files": multiple
          ? `You can only upload up to ${multiple} files`
          : "You can only upload one file",
        "file-too-large": `File size cannot exceed ${Math.round(
          maxSize / (1024 * 1024)
        )}MB`,
        "file-invalid-type": `Only ${allowedExtensions.join(
          ", "
        )} files are allowed`,
      };
      const firstError = fileRejections[0].errors[0];
      const errorMessage =
        errorMessages[firstError.code as keyof typeof errorMessages];
      if (errorMessage) {
        toast.error(errorMessage);
      }
    },
    [maxSize, allowedExtensions, multiple]
  );

  const acceptObj = allowedExtensions.reduce((acc, ext) => {
    if (ext === "pdf") {
      acc["application/pdf"] = [".pdf"];
    } else {
      acc["image/*"] = [".png", ".jpg", ".jpeg", ".webp", ".gif"];
    }
    return acc;
  }, {} as Record<string, string[]>);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    maxFiles: multiple ? 10 : 1,
    maxSize,
    accept: acceptObj,
    multiple,
  });

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      {/* Show dropzone only if multiple is true, or if no file is uploaded */}
      {(multiple || files.length === 0) && (
        <Card
          {...getRootProps()}
          className={cn(
            "relative border transition-colors duration-200 ease-in-out w-full h-40 cursor-pointer",
            isDragActive
              ? "border-[var(--c-violet)] bg-[var(--c-violet)]/10"
              : "border-gray-300 hover:border-[var(--c-violet)]"
          )}
        >
          <CardContent className="flex flex-col items-center justify-center h-full w-full">
            <input {...getInputProps()} />
            {isDragActive ? (
              <p className="text-sm text-gray-600">Drop your file(s) here</p>
            ) : (
              <div className="flex flex-col items-center justify-center h-full w-full gap-y-4">
                {allowedExtensions.includes("pdf") ? (
                  <FileText className="w-12 h-12 text-gray-400" />
                ) : (
                  <User className="w-12 h-12 text-gray-400" />
                )}
                <p className="text-sm text-gray-600 text-center">
                  Drop your file(s) here, or click to select
                </p>
                <Button
                  className="bg-[var(--c-violet)] text-white hover:bg-[var(--c-violet)]/90 cursor-pointer"
                  type="button"
                >
                  Choose File
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file) => (
            <div key={file.id} className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-200 flex items-center justify-center bg-white">
                  {file.objectUrl ? (
                    <img
                      src={file.objectUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FileText className="w-10 h-10 text-gray-400" />
                  )}
                </div>
                {file.uploading && !file.isDeleting && (
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                    <p className="text-white font-medium text-sm">
                      {file.progress}%
                    </p>
                  </div>
                )}
                {file.error && (
                  <div className="absolute inset-0 bg-red-500/50 rounded-full flex items-center justify-center">
                    <p className="text-white font-medium text-xs">Error</p>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {file.file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {Math.round(file.file.size / 1024)} KB
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => removeFile(file.id)}
                disabled={file.uploading || file.isDeleting}
              >
                {file.isDeleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
