"use client";

import { useCurrentResumeContent } from "@/hooks/use-resume-content";

interface ResumeChatPanelProps {
  s3Url: string;
}

export const ResumeChatPanel = ({ s3Url }: ResumeChatPanelProps) => {
  console.log("ResumeChatPanel rendered with s3Url:", s3Url);
  const {
    data: extractedText,
    isLoading,
    isError,
    error,
  } = useCurrentResumeContent({ s3Url });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        Extracting text from your resume...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-full text-red-500">
        {(error as Error).message || "Failed to extract resume text."}
      </div>
    );
  }

  return (
    <div className="p-4 overflow-y-auto max-h-[calc(100vh-10.1rem)] whitespace-pre-wrap text-sm font-mono text-gray-800">
      {extractedText}
    </div>
  );
};
