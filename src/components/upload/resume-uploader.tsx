"use client";

import React, { useRef, useState } from "react";
import axiosInstance from "@/lib/axios";
import { api } from "@/config/directory";
import { FILE_CATEGORY_CONFIG } from "@/config/file-category-config";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Loader2, FileText } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { cacheKeys } from "@/config/cache-keys";

export default function ResumeUploader() {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const config = FILE_CATEGORY_CONFIG["resume"];

  // Handle file input change
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    await handleFiles(Array.from(files));
    e.target.value = "";
  };

  // Handle drag and drop
  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (uploading) return;
    const files = Array.from(e.dataTransfer.files);
    await handleFiles(files);
  };

  const handleFiles = async (files: File[]) => {
    for (const file of files) {
      if (
        !config.allowedExtensions.includes(file.name.split(".").pop() || "")
      ) {
        toast.error(
          `Only ${config.allowedExtensions.join(", ")} files allowed`
        );
        continue;
      }
      if (file.size > config.maxSize) {
        toast.error(
          `File size exceeds limit (${config.maxSize / (1024 * 1024)}MB)`
        );
        continue;
      }
      await uploadResume(file);
    }
  };

  // Upload a single resume
  const uploadResume = async (file: File) => {
    setUploading(true);
    setUploadProgress(0);
    try {
      // 1. Get presigned URL
      const presignRes = await axiosInstance.post(api.s3, {
        fileName: file.name,
        contentType: file.type,
        size: file.size,
        folderPath: config.folder,
        fileCategory: "resume",
      });
      const { presignedUrl, fileName, fileUrl } = presignRes.data;
      // 2. Upload to S3
      await axiosInstance.put(presignedUrl, file, {
        headers: { "Content-Type": file.type },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            setUploadProgress(
              Math.round((progressEvent.loaded / progressEvent.total) * 100)
            );
          }
        },
      });
      // 3. Create DB record
      const resume = await axiosInstance.post(api.jobSeekerResume, {
        fileName,
        s3Url: fileUrl,
        fileSize: file.size,
      });
      toast.message("Resume uploaded, processing embeddings in the background");

      // 4. Chunk, embed, index, and upsert the resume into Pinecone + Supabase (non-blocking)
      processResumeInBackground(fileUrl, resume.data.resume.id);

      queryClient.invalidateQueries({ queryKey: [cacheKeys.myResumeList] });
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Failed to upload resume");
    } finally {
      setUploading(false);
      setUploadProgress(null);
    }
  };

  // Process resume in background helper function for non-blocking background processing
  const processResumeInBackground = async (s3Url: string, resumeId: string) => {
    try {
      await axiosInstance.post(api.processResume, { s3Url, resumeId });
      toast.success("Resume processed and indexed successfully.");
      queryClient.invalidateQueries({ queryKey: [cacheKeys.myResumeList] });
    } catch (err) {
      toast.error("Resume uploaded but processing failed.");
      console.error("Background resume processing failed:", err);
    }
  };

  return (
    <div className="font-libertinus">
      {/* Uploader Area */}
      <div
        className="border-dashed border-2 border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer bg-white hover:border-[var(--r-blue)] transition-colors"
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        style={{ minHeight: 160 }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={config.allowedExtensions.map((ext) => "." + ext).join(",")}
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
        <FileText className="w-10 h-10 text-gray-400 mb-2" />
        <p className="text-gray-600 text-center mb-2 text-sm font-libertinus">
          Drag and drop your resume, or click to select
        </p>
        <Button
          className="bg-[var(--r-blue)] text-white hover:bg-[var(--r-blue)]/90"
          type="button"
          disabled={uploading}
        >
          {uploading ? (
            <span className="flex items-center">
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Uploading...
            </span>
          ) : (
            "Upload Resume"
          )}
        </Button>
        {uploadProgress !== null && (
          <div className="w-full mt-2">
            <div className="h-2 bg-gray-200 rounded-full">
              <div
                className="h-2 bg-[var(--r-blue)] rounded-full transition-all"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1 text-center">
              {uploadProgress}%
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
