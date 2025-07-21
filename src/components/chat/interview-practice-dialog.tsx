"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { InterviewPracticePanel } from "../chat/interview-practice-panel";
import { Play, Target } from "lucide-react";
import { useCurrentResumeContent } from "@/hooks/use-resume-content";
import { Message } from "@ai-sdk/react";

interface InterviewPracticeDialogProps {
  resumeS3Url: string;
  jobDescription: string;
  candidateName: string;
  children?: React.ReactNode;
}

export const InterviewPracticeDialog = ({
  resumeS3Url,
  jobDescription,
  candidateName,
  children,
}: InterviewPracticeDialogProps) => {
  const [open, setOpen] = useState(false);
  const [persistentMessages, setPersistentMessages] = useState<Message[]>([]);

  const {
    data: resumeContent,
    isLoading,
    isError,
  } = useCurrentResumeContent({
    s3Url: resumeS3Url,
    enabled: open, // Only fetch when dialog is open
  });

  const defaultTrigger = (
    <Button className="w-full h-12 text-lg bg-[var(--r-blue)] text-white hover:bg-[var(--r-blue)]/80 mt-4 flex items-center gap-2">
      <Play className="w-5 h-5" />
      Practice Interview Questions
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children || defaultTrigger}</DialogTrigger>
      <DialogContent
        className="max-w-[80vw] min-w-[50vw] max-h-[85vh] w-full h-full p-0 flex flex-col"
        showCloseButton={true}
      >
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle className="text-2xl font-dm-serif text-[var(--r-black)] flex items-center gap-3">
            <Target className="w-6 h-6 text-[var(--r-blue)]" />
            Interview Practice
            <div className="text-lg text-[var(--r-boldgray)] font-normal">
              • {candidateName}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--r-blue)] mx-auto mb-2"></div>
                <div className="text-[var(--r-boldgray)]">
                  Loading resume content for practice...
                </div>
              </div>
            </div>
          ) : isError ? (
            <div className="flex items-center justify-center h-full text-red-500">
              <div className="text-center">
                <p className="font-semibold">Failed to load resume content</p>
                <p className="text-sm mt-1">
                  Please try again or contact support if the issue persists.
                </p>
              </div>
            </div>
          ) : (
            <InterviewPracticePanel
              resumeContent={resumeContent || ""}
              jobDescription={jobDescription}
              candidateName={candidateName}
              persistentMessages={persistentMessages}
              onMessagesChange={setPersistentMessages}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
