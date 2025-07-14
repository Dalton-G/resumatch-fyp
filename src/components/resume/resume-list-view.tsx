"use client";

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

interface ResumeListViewProps {
  resumes: Resume[];
  isLoading: boolean;
  selectedResumeId: string | null;
  onResumeSelect: (resumeId: string) => void;
  onResumeDeleted?: (deletedResumeId: string) => void;
}

export function ResumeListView({
  resumes,
  isLoading,
  selectedResumeId,
  onResumeSelect,
  onResumeDeleted,
}: ResumeListViewProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [resumeToDelete, setResumeToDelete] = useState<Resume | null>(null);
  const [deleting, setDeleting] = useState(false);
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    if (!resumeToDelete) return;
    setDeleting(true);
    try {
      await axiosInstance.delete(api.jobSeekerResume, {
        data: { resumeId: resumeToDelete.id },
      });
      toast.success("Resume and all associated data deleted successfully");

      // Notify parent component about the deletion
      if (onResumeDeleted) {
        onResumeDeleted(resumeToDelete.id);
      }

      setResumeToDelete(null);
      setDeleteDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: [cacheKeys.myResumeList] });
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Failed to delete resume");
    } finally {
      setDeleting(false);
    }
  };

  if (isLoading) {
    return <p className="text-gray-500 text-center">Loading...</p>;
  }

  if (resumes.length === 0) {
    return (
      <p className="text-gray-500 text-center">No resumes uploaded yet.</p>
    );
  }

  return (
    <>
      {resumes.map((resume) => (
        <div
          key={resume.id}
          className={`flex items-center gap-2 p-2 rounded cursor-pointer border ${
            selectedResumeId === resume.id
              ? "border-[var(--r-blue)] bg-[var(--r-blue)]/10"
              : "border-gray-200 hover:border-[var(--r-blue)]"
          }`}
          onClick={() => onResumeSelect(resume.id)}
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
                disabled={deleting}
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
                  ? This will permanently remove the resume file, all processed
                  chunks, and embeddings. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel
                  onClick={() => setDeleteDialogOpen(false)}
                  disabled={deleting}
                >
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={deleting}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {deleting ? "Deleting..." : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ))}
    </>
  );
}
