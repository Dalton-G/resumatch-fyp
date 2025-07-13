"use client";

import { Separator } from "@radix-ui/react-separator";
import ResumeUploader from "../upload/resume-uploader";
import { MdCompareArrows } from "react-icons/md";
import { useMyResume } from "@/hooks/use-my-resume";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { TbContract } from "react-icons/tb";
import axiosInstance from "@/lib/axios";
import { api } from "@/config/directory";
import { FileText, Loader2, Target, Trash2 } from "lucide-react";
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
import { Textarea } from "../ui/textarea";
import { useCurrentResumeContent } from "@/hooks/use-resume-content";
import { useResumeComparison } from "@/hooks/use-resume-comparison";

export default function ResumeOptimizerContent() {
  const { data: resumes = [], isLoading } = useMyResume();
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [resumeToDelete, setResumeToDelete] = useState<any>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [shouldCompare, setShouldCompare] = useState(false);
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

  const {
    data: resumeContent,
    isLoading: isResumeLoading,
    isError: isResumeError,
  } = useCurrentResumeContent({
    s3Url: selectedResume?.s3Url || null,
    enabled: !!selectedResume,
  });

  const compareWithJob = () => {
    setShouldCompare(true);
  };

  const {
    data: comparisonResult,
    isLoading: isComparing,
    isError: isCompareError,
    error: compareError,
  } = useResumeComparison({
    resumeContent: resumeContent || null,
    jobDescription,
    enabled: !!resumeContent && !!jobDescription && shouldCompare,
  });

  useEffect(() => {
    setShouldCompare(false);
  }, [selectedResumeId, jobDescription]);

  return (
    <div className="flex flex-row">
      <div className="w-1/6 bg-white p-8 border-r-1 border-[var(--r-darkgray)] min-h-[calc(100vh-6.3rem)]">
        <div className="flex flex-col gap-4 font-libertinus">
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
      <div className="flex-1 flex flex-col">
        <div className="flex flex-col bg-white p-4 border-b-1 border-[var(--r-darkgray)]">
          <div className="font-dm-serif text-xl">
            Compare Resume with Job Description
          </div>
          <div className="font-libertinus">
            Paste a job description to see how well your resume matches
          </div>
        </div>
        <div className="flex flex-row items-center justify-center">
          <div className="flex flex-col w-full min-h-full border-r-1 border-[var(--r-darkgray)]">
            <div className="flex min-h-[calc(100vh-12rem)] justify-center w-full font-libertinus ">
              <div className="flex w-full flex-col items-center gap-6 text-black">
                {/* Text Area for Job Description */}
                <div className="w-full flex flex-col">
                  <div className="px-6 flex-1 flex flex-col">
                    <label
                      htmlFor="job-description"
                      className="text-lg font-medium font-dm-serif mt-2 mb-4"
                    >
                      Job Description
                    </label>
                    <Textarea
                      id="job-description"
                      placeholder="Paste the job description here..."
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      className="resize-none h-[calc(100vh-20rem)] border-2 shadow-none border-[var(--r-darkgray)] focus-visible:border-black focus-visible:ring-0 focus-visible:shadow-none hover:border-black transition-colors"
                    />
                    <Button
                      onClick={compareWithJob}
                      disabled={isComparing || !jobDescription.trim()}
                      className="mt-4 bg-[var(--r-blue)] hover:bg-[var(--r-blue)]/80 text-white font-semibold"
                    >
                      {isComparing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Analyzing Match...
                        </>
                      ) : (
                        <>
                          <Target className="h-4 w-4 mr-2" />
                          Compare Resume
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col w-full min-h-full">
            {selectedResume ? (
              <div className="flex min-h-[calc(100vh-12rem)] justify-center w-full font-libertinus">
                {isComparing ? (
                  <div className="flex flex-col justify-center items-center text-center w-full">
                    <Loader2 className="animate-spin w-6 h-6 mx-auto text-gray-500" />
                    <p className="mt-2">
                      Analyzing resume and job description...
                    </p>
                  </div>
                ) : comparisonResult ? (
                  <div className="space-y-4 max-w-3xl text-left text-sm">
                    <p className="text-xl font-bold">
                      Match Score: {comparisonResult.matchScore}%
                    </p>

                    <p>
                      <strong>Feedback:</strong>{" "}
                      {comparisonResult.matchFeedback}
                    </p>

                    <div>
                      <strong>Matching Keywords:</strong>
                      <ul className="list-disc list-inside text-green-700">
                        {comparisonResult.matchingKeywords.map((kw: string) => (
                          <li key={kw}>{kw}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <strong>Missing Keywords:</strong>
                      <ul className="list-disc list-inside text-red-600">
                        {comparisonResult.missingKeywords.map((kw: string) => (
                          <li key={kw}>{kw}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <strong>Recommendations:</strong>
                      <ul className="list-disc list-inside text-blue-700">
                        {comparisonResult.recommendations.map((rec: string) => (
                          <li key={rec}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center w-full text-[var(--r-boldgray)] gap-6">
                    <TbContract className="text-[var(--r-boldgray)] text-6xl" />
                    <p className="text-2xl mx-12 text-center">
                      Paste a job description & Click "Compare Resume" to get
                      insights.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex min-h-[calc(100vh-12rem)] items-center justify-center w-full font-libertinus">
                <div className="flex flex-col items-center gap-6 text-[var(--r-boldgray)]">
                  <MdCompareArrows className="text-[var(--r-boldgray)] text-6xl" />
                  <p className="text-2xl">
                    Please Select a Resume to Start Comparing
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
