"use client";

import { Separator } from "@radix-ui/react-separator";
import ResumeUploader from "../upload/resume-uploader";
import {
  IoDocumentTextOutline,
  IoChatbubbleEllipsesOutline,
} from "react-icons/io5";
import { useMyResume } from "@/hooks/use-my-resume";
import { useState } from "react";
import { Resume } from "@prisma/client";
import { ResumeChatPanel } from "../chat/resume-chat-panel";
import { ResumeListView } from "./resume-list-view";

export default function MyResumeContent() {
  const { data: resumes = [], isLoading } = useMyResume();
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);

  const handleResumeSelect = (resumeId: string) => {
    setSelectedResumeId(resumeId);
  };

  const handleResumeDeleted = (deletedResumeId: string) => {
    if (selectedResumeId === deletedResumeId) {
      setSelectedResumeId(null);
    }
  };

  const selectedResume: Resume = resumes.find(
    (r: any) => r.id === selectedResumeId
  );

  return (
    <div className="flex flex-row">
      <div className="w-1/6 bg-white p-8 border-r-1 border-[var(--r-darkgray)] min-h-[calc(100vh-6.3rem)]">
        <div className="flex flex-col gap-4 font-libertinus">
          <ResumeUploader />
          <Separator className="my-4 border-[var(--r-darkgray)] border-1" />
          {/* Resume List View */}
          <ResumeListView
            resumes={resumes}
            isLoading={isLoading}
            selectedResumeId={selectedResumeId}
            onResumeSelect={handleResumeSelect}
            onResumeDeleted={handleResumeDeleted}
          />
        </div>
      </div>
      <div className="flex-1 flex flex-row items-center justify-center bg-white">
        <div className="flex flex-col w-full min-h-full border-r-1 border-[var(--r-darkgray)]">
          <div className="flex gap-4 items-center bg-white p-4 font-dm-serif border-b-1 border-[var(--r-darkgray)] text-xl">
            <IoDocumentTextOutline className="text-[var(--r-boldgray)] text-2xl" />
            <p>Preview Resume</p>
          </div>
          {selectedResume ? (
            <iframe
              src={selectedResume.s3Url}
              className="w-full min-h-[calc(100vh-10.1rem)]"
              title="Resume"
            />
          ) : (
            <div className="flex min-h-[calc(100vh-10.1rem)] items-center justify-center w-full font-libertinus">
              <div className="flex flex-col items-center gap-6 text-[var(--r-boldgray)]">
                <IoDocumentTextOutline className="text-[var(--r-boldgray)] text-6xl" />
                <p className="text-2xl">Please Select a Resume to Preview</p>
              </div>
            </div>
          )}
        </div>
        <div className="flex flex-col w-full min-h-full">
          <div className="flex gap-4 items-center bg-white p-4 font-dm-serif border-b-1 border-[var(--r-darkgray)] text-xl">
            <IoChatbubbleEllipsesOutline className="text-[var(--r-boldgray)] text-2xl" />
            <p>Chat with your Resume</p>
          </div>
          {selectedResume ? (
            <div className="flex min-h-[calc(100vh-10.1rem)] items-center justify-center w-full font-libertinus">
              <ResumeChatPanel s3Url={selectedResume.s3Url} />
            </div>
          ) : (
            <div className="flex min-h-[calc(100vh-10.1rem)] items-center justify-center w-full font-libertinus">
              <div className="flex flex-col items-center gap-6 text-[var(--r-boldgray)]">
                <IoChatbubbleEllipsesOutline className="text-[var(--r-boldgray)] text-6xl" />
                <p className="text-2xl">
                  Please Select a Resume to Start Chatting
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
