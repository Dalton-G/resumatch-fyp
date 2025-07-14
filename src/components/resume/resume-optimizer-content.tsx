"use client";

import { Separator } from "@radix-ui/react-separator";
import ResumeUploader from "../upload/resume-uploader";
import { MdCompareArrows } from "react-icons/md";
import { useMyResume } from "@/hooks/use-my-resume";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { TbContract } from "react-icons/tb";
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Target,
  TrendingUp,
} from "lucide-react";
import { Resume } from "@prisma/client";
import { Textarea } from "../ui/textarea";
import { useCurrentResumeContent } from "@/hooks/use-resume-content";
import { useResumeComparison } from "@/hooks/use-resume-comparison";
import { ScrollArea } from "../ui/scroll-area";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { ResumeListView } from "./resume-list-view";

export default function ResumeOptimizerContent() {
  const { data: resumes = [], isLoading } = useMyResume();
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [shouldCompare, setShouldCompare] = useState(false);

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
      <div className="flex-1 flex flex-col bg-white">
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
                      className="resize-none h-[calc(100vh-20rem)] border-2 shadow-none border-[var(--r-darkgray)] focus-visible:border-black focus-visible:ring-0 focus-visible:shadow-none hover:border-black transition-colors !text-lg"
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
                  <ScrollArea className="flex-1 px-6 h-[calc(100vh-12rem)] overflow-y-auto">
                    {!comparisonResult ? (
                      <div className="text-center py-12">
                        <Target className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-lg font-medium mb-2">
                          Ready to Compare?
                        </h3>
                        <p className="text-gray-600">
                          Paste a job description on the left to see how well
                          your resume matches the requirements.
                        </p>
                      </div>
                    ) : (
                      <div>
                        <div className="text-lg font-medium font-dm-serif mt-2 mb-4">
                          Results
                        </div>
                        <div className="space-y-6">
                          {/* Match Score */}
                          <div className="bg-gradient-to-r from-green-100 to-emerald-50 rounded-lg p-6">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="text-2xl font-medium">
                                Match Score
                              </h4>
                              <div className="text-3xl font-bold text-green-600">
                                {comparisonResult.matchScore}%
                              </div>
                            </div>
                            <Progress
                              value={comparisonResult.matchScore}
                              className="mb-2"
                            />
                            <p className="text-md text-black">
                              {comparisonResult.matchFeedback}
                            </p>
                          </div>
                          {/* Matching Keywords */}
                          <div className="border rounded-lg p-6 bg-white">
                            <h4 className="text-xl font-medium mb-4 flex items-center gap-2">
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                              Matching Keywords (
                              {comparisonResult.matchingKeywords?.length || 0})
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {comparisonResult.matchingKeywords?.map(
                                (keyword: string, index: number) => (
                                  <Badge
                                    key={index}
                                    variant="secondary"
                                    className="bg-green-100 text-green-800 text-md"
                                  >
                                    {keyword}
                                  </Badge>
                                )
                              )}
                            </div>
                          </div>
                          {/* Missing Keywords */}
                          <div className="border rounded-lg p-6 bg-white">
                            <h4 className="text-xl font-medium mb-4 flex items-center gap-2">
                              <AlertTriangle className="h-5 w-5 text-red-500" />
                              Missing Keywords (
                              {comparisonResult.missingKeywords?.length || 0})
                            </h4>
                            <div className="flex flex-wrap gap-2 mb-4">
                              {comparisonResult.missingKeywords?.map(
                                (keyword: string, index: number) => (
                                  <Badge
                                    key={index}
                                    variant="destructive"
                                    className="bg-red-100 text-red-800 text-md"
                                  >
                                    {keyword}
                                  </Badge>
                                )
                              )}
                            </div>
                            {comparisonResult.missingKeywords?.length > 0 && (
                              <p className="text-md text-gray-600">
                                Consider adding these keywords to your resume if
                                you have relevant experience.
                              </p>
                            )}
                          </div>
                          {/* Recommendations */}
                          <div className="border rounded-lg p-6 bg-white">
                            <h4 className="text-xl font-medium mb-4 flex items-center gap-2">
                              <TrendingUp className="h-5 w-5 text-blue-500" />
                              Recommendations
                            </h4>
                            <div className="space-y-3">
                              {comparisonResult.recommendations?.map(
                                (rec: string, index: number) => (
                                  <div
                                    key={index}
                                    className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg"
                                  >
                                    <TrendingUp className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                    <p className="text-md">{rec}</p>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </ScrollArea>
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
