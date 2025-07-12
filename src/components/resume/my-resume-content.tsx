"use client";

import { Separator } from "@radix-ui/react-separator";
import ResumeUploader from "../upload/resume-uploader";
import {
  IoDocumentTextOutline,
  IoChatbubbleEllipsesOutline,
} from "react-icons/io5";
import { useMyResume } from "@/hooks/use-my-resume";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import axiosInstance from "@/lib/axios";
import { api } from "@/config/directory";
import { FileText, Trash2 } from "lucide-react";
import { cleanFilename } from "@/lib/utils/clean-filename";
import { useQueryClient } from "@tanstack/react-query";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { cacheKeys } from "@/config/cache-keys";
import { Resume } from "@prisma/client";
import { useCurrentResumeContent } from "@/hooks/use-resume-content";
import { ResumeChatPanel } from "../chat/resume-chat-panel";

export default function MyResumeContent() {
  const { data: resumes = [], isLoading } = useMyResume();
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [resumeToDelete, setResumeToDelete] = useState<any>(null);
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    if (!resumeToDelete) return;
    try {
      await axiosInstance.delete(api.jobSeekerResume, {
        data: { resumeId: resumeToDelete.id },
      });
      toast.success("Resume deleted");
      setResumeToDelete(null);
      setDeleteDialogOpen(false);
      if (selectedResumeId === resumeToDelete.id) setSelectedResumeId(null);
      queryClient.invalidateQueries({ queryKey: [cacheKeys.myResumeList] });
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Failed to delete resume");
    }
  };

  const selectedResume: Resume = resumes.find(
    (r: any) => r.id === selectedResumeId
  );

  return (
    <div className="flex flex-row">
      <div className="w-1/6 bg-white p-8 border-r-1 border-[var(--r-darkgray)] min-h-[calc(100vh-6.3rem)]">
        <div className="flex flex-col gap-4">
          <ResumeUploader />
          <Separator className="my-4 border-[var(--r-darkgray)] border-1" />
          {/* List of Resumes as cards */}
          {isLoading ? (
            <p className="text-gray-500 text-center">Loading...</p>
          ) : resumes.length === 0 ? (
            <p className="text-gray-500 text-center">
              No resumes uploaded yet.
            </p>
          ) : (
            resumes.map((resume: any) => (
              <div
                key={resume.id}
                className={`flex items-center gap-2 p-2 rounded cursor-pointer border ${
                  selectedResumeId === resume.id
                    ? "border-[var(--r-blue)] bg-[var(--r-blue)]/10"
                    : "border-gray-200 hover:border-[var(--r-blue)]"
                }`}
                onClick={() => setSelectedResumeId(resume.id)}
              >
                <FileText className="w-6 h-6 text-gray-400" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-900 truncate overflow-hidden max-w-[100px]">
                    {cleanFilename(resume.fileName)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(resume.fileSize / 1024).toFixed(1)} KB
                  </p>
                </div>
                <AlertDialog
                  open={deleteDialogOpen && resumeToDelete?.id === resume.id}
                  onOpenChange={setDeleteDialogOpen}
                >
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setResumeToDelete(resume);
                        setDeleteDialogOpen(true);
                      }}
                      className="hover:bg-red-400 hover:text-white"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Resume</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete{" "}
                        <span className="font-semibold">
                          {cleanFilename(resume.fileName)}
                        </span>
                        ? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel
                        onClick={() => setDeleteDialogOpen(false)}
                      >
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ))
          )}
        </div>
      </div>
      <div className="flex-1 flex flex-row items-center justify-center">
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
            <div>
              <p>{selectedResume.s3Url}</p>
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
