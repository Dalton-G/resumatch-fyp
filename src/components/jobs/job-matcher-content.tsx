"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useMyResume } from "@/hooks/use-my-resume";
import { countryOptions } from "@/config/country-options";
import { workTypeOptions } from "@/config/job-posting-options";
import { cleanFilename } from "@/lib/utils/clean-filename";
import { HiMiniSparkles } from "react-icons/hi2";
import {
  Loader2,
  Target,
  CheckCircle2,
  AlertCircle,
  Star,
  ArrowUpDown,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRouter } from "next/navigation";
import { pages } from "@/config/directory";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useJobMatching } from "@/hooks/use-job-matching";
import { MdAutoGraph } from "react-icons/md";
import { TbVectorSpline } from "react-icons/tb";

interface JobMatcherContentProps {
  userId: string;
}

interface JobMatchFormData {
  resumeId: string;
  salaryMin: string;
  salaryMax: string;
  position: string;
  workType: string;
  country: string;
  amount: number;
}

type SortOption = "aiScore" | "embeddingScore";

export default function JobMatcherContent({ userId }: JobMatcherContentProps) {
  const router = useRouter();
  const { data: resumes = [], isLoading: isLoadingResumes } = useMyResume();

  const [formData, setFormData] = useState<JobMatchFormData>({
    resumeId: "",
    salaryMin: "",
    salaryMax: "",
    position: "",
    workType: "",
    country: "",
    amount: 5,
  });

  const [shouldMatch, setShouldMatch] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("aiScore");

  const { data: matchingResults, isLoading: isMatching } = useJobMatching({
    resumeId: formData.resumeId,
    filters: {
      salaryMin: formData.salaryMin ? parseInt(formData.salaryMin) : undefined,
      salaryMax: formData.salaryMax ? parseInt(formData.salaryMax) : undefined,
      position: formData.position || undefined,
      workType: formData.workType || undefined,
      country: formData.country || undefined,
      amount: formData.amount,
    },
    enabled: shouldMatch && !!formData.resumeId,
  });

  const handleSubmit = () => {
    if (!formData.resumeId) {
      toast.error("Please select a resume first");
      return;
    }

    // Optional validation for salary range
    const minSalary = formData.salaryMin ? parseInt(formData.salaryMin) : null;
    const maxSalary = formData.salaryMax ? parseInt(formData.salaryMax) : null;

    if (minSalary && maxSalary && minSalary > maxSalary) {
      toast.error("Minimum salary cannot be greater than maximum salary");
      return;
    }

    setShouldMatch(true);
  };

  const handleReset = () => {
    setFormData({
      resumeId: "",
      salaryMin: "",
      salaryMax: "",
      position: "",
      workType: "",
      country: "",
      amount: 5,
    });
    setShouldMatch(false);
  };

  const handleViewJob = (jobId: string) => {
    router.push(pages.viewJob(jobId));
  };

  // Sort recommendations based on selected option
  const getSortedRecommendations = (recommendations: any[]) => {
    if (!recommendations) return [];

    const sorted = [...recommendations].sort((a, b) => {
      if (sortBy === "aiScore") {
        return b.matchScore - a.matchScore; // Highest AI score first
      } else {
        return b.embeddingSimilarity - a.embeddingSimilarity; // Highest embedding similarity first
      }
    });

    return sorted;
  };

  return (
    <div className="flex flex-row">
      {/* Left Panel - Form */}
      <div className="w-1/3 bg-white p-8 border-r-1 border-[var(--r-darkgray)] max-h-[calc(100vh-6.5rem)] min-h-[calc(100vh-6.5rem)] overflow-y-auto">
        <div className="flex flex-col gap-6 font-libertinus">
          <div className="text-xl font-dm-serif text-[var(--r-boldgray)] mb-2">
            Find Your Perfect Job Match
          </div>
          <div className="text-md text-gray-600 mb-4">
            Select your resume and apply filters to discover job opportunities
            tailored to your skills and preferences.
          </div>

          {/* Resume Selection */}
          <div>
            <label className="block font-medium mb-2 text-[var(--r-boldgray)]">
              Select Resume *
            </label>
            <Select
              value={formData.resumeId}
              onValueChange={(value) =>
                setFormData({ ...formData, resumeId: value })
              }
            >
              <SelectTrigger className="w-full bg-white !text-lg h-12">
                <SelectValue placeholder="Choose a resume" />
              </SelectTrigger>
              <SelectContent>
                {isLoadingResumes ? (
                  <div className="p-4 text-center">
                    <Loader2 className="h-4 w-4 animate-spin mx-auto mb-2" />
                    Loading resumes...
                  </div>
                ) : resumes.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    No resumes found. Upload a resume first.
                  </div>
                ) : (
                  resumes.map((resume: any) => (
                    <SelectItem key={resume.id} value={resume.id}>
                      {cleanFilename(resume.fileName)}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Optional Filters */}
          <div className="text-lg font-dm-serif text-[var(--r-boldgray)]">
            Optional Filters
          </div>

          {/* Salary Range */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block font-medium mb-2 text-[var(--r-boldgray)]">
                Min Salary
              </label>
              <Input
                type="number"
                placeholder="e.g. 50000"
                value={formData.salaryMin}
                onChange={(e) =>
                  setFormData({ ...formData, salaryMin: e.target.value })
                }
                className="bg-white !text-lg h-12"
              />
            </div>
            <div className="flex-1">
              <label className="block font-medium mb-2 text-[var(--r-boldgray)]">
                Max Salary
              </label>
              <Input
                type="number"
                placeholder="e.g. 100000"
                value={formData.salaryMax}
                onChange={(e) =>
                  setFormData({ ...formData, salaryMax: e.target.value })
                }
                className="bg-white !text-lg h-12"
              />
            </div>
          </div>

          {/* Position */}
          <div>
            <label className="block font-medium mb-2 text-[var(--r-boldgray)]">
              Position Title
            </label>
            <Input
              placeholder="e.g. Software Engineer, Data Scientist"
              value={formData.position}
              onChange={(e) =>
                setFormData({ ...formData, position: e.target.value })
              }
              className="bg-white !text-lg h-12"
            />
          </div>

          {/* Work Type */}
          <div>
            <label className="block font-medium mb-2 text-[var(--r-boldgray)]">
              Work Type
            </label>
            <Select
              value={formData.workType}
              onValueChange={(value) =>
                setFormData({ ...formData, workType: value })
              }
            >
              <SelectTrigger className="w-full bg-white !text-lg h-12">
                <SelectValue placeholder="Select work type" />
              </SelectTrigger>
              <SelectContent>
                {workTypeOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Country */}
          <div>
            <label className="block font-medium mb-2 text-[var(--r-boldgray)]">
              Country
            </label>
            <Select
              value={formData.country}
              onValueChange={(value) =>
                setFormData({ ...formData, country: value })
              }
            >
              <SelectTrigger className="w-full bg-white !text-lg h-12">
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                {countryOptions.map((country) => (
                  <SelectItem key={country} value={country}>
                    {country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Amount (Top K) */}
          <div>
            <label className="block font-medium mb-2 text-[var(--r-boldgray)]">
              Number of Results ({formData.amount})
            </label>
            <Select
              value={formData.amount.toString()}
              onValueChange={(value) =>
                setFormData({ ...formData, amount: parseInt(value) })
              }
            >
              <SelectTrigger className="w-full bg-white !text-lg h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5].map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num} {num === 1 ? "Job" : "Jobs"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-6">
            <Button
              onClick={handleSubmit}
              disabled={isMatching || !formData.resumeId}
              className="flex-1 bg-[var(--r-blue)] hover:bg-[var(--r-blue)]/80 text-white font-dm-serif h-12"
            >
              {isMatching ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Finding Matches...
                </>
              ) : (
                <>
                  <HiMiniSparkles className="h-4 w-4 mr-2" />
                  Find Jobs
                </>
              )}
            </Button>
            <Button
              onClick={handleReset}
              variant="outline"
              className="h-12 px-6 text-[var(--r-boldgray)]"
            >
              Reset
            </Button>
          </div>
        </div>
      </div>

      {/* Right Panel - Results */}
      <div className="flex-1 flex flex-col bg-white font-libertinus">
        {isMatching ? (
          <div className="flex flex-col justify-center items-center h-full text-center">
            <Loader2 className="h-12 w-12 animate-spin text-[var(--r-blue)] mb-4" />
            <h3 className="text-xl font-medium mb-2">
              Finding Your Perfect Matches
            </h3>
            <p className="text-gray-600">
              Our AI is analyzing your resume and searching for the best job
              opportunities...
            </p>
          </div>
        ) : matchingResults ? (
          <ScrollArea className="h-[calc(100vh-6.5rem)] px-8 py-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Target className="h-6 w-6 text-[var(--r-blue)]" />
                  <h2 className="text-2xl font-dm-serif text-[var(--r-boldgray)]">
                    Job Recommendations (
                    {matchingResults.recommendations?.length || 0})
                  </h2>
                </div>

                {/* Sort Options */}
                {matchingResults.recommendations &&
                  matchingResults.recommendations.length > 0 && (
                    <div className="flex items-center gap-2">
                      <ArrowUpDown className="h-4 w-4 text-gray-600" />
                      <Select
                        value={sortBy}
                        onValueChange={(value: SortOption) => setSortBy(value)}
                      >
                        <SelectTrigger className="w-[180px] bg-white text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="aiScore">
                            <div className="flex items-center gap-2">
                              <Star className="h-3 w-3" />
                              AI Match Score
                            </div>
                          </SelectItem>
                          <SelectItem value="embeddingScore">
                            <div className="flex items-center gap-2">
                              <TbVectorSpline className="h-3 w-3" />
                              Embedding Score
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
              </div>

              {/* Search Summary */}
              {matchingResults.searchSummary && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <p className="text-blue-800">
                    {matchingResults.searchSummary}
                  </p>
                </div>
              )}

              {matchingResults.recommendations?.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium mb-2">No Matches Found</h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    We couldn't find any jobs that match your criteria. Try
                    adjusting your filters or check back later for new
                    opportunities.
                  </p>
                </div>
              ) : (
                getSortedRecommendations(matchingResults.recommendations)?.map(
                  (job: any, index: number) => (
                    <Card
                      key={job.jobId}
                      className="rounded-xl shadow-lg border-2 hover:shadow-xl transition-shadow"
                    >
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-2xl font-dm-serif text-[var(--r-boldgray)]">
                                {job.title}
                              </h3>
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant="secondary"
                                  className={`text-md ${
                                    sortBy === "aiScore"
                                      ? "bg-[var(--r-blue)]/20 text-[var(--r-blue)] ring-2 ring-[var(--r-blue)]/30"
                                      : "bg-[var(--r-blue)]/10 text-[var(--r-blue)]"
                                  }`}
                                >
                                  <Star className="h-3 w-3 mr-1" />
                                  AI Match: {job.matchScore}%
                                </Badge>
                                <Badge
                                  variant="outline"
                                  className={`text-md ${
                                    sortBy === "embeddingScore"
                                      ? "bg-gray-100 text-gray-700 border-gray-400 ring-2 ring-gray-300"
                                      : "bg-gray-50 text-gray-600 border-gray-300"
                                  }`}
                                >
                                  <TbVectorSpline className="h-3 w-3 mr-1" />
                                  Embedding: {job.embeddingSimilarity}%
                                </Badge>
                              </div>
                            </div>
                            <p className="text-lg text-gray-700 mb-2">
                              {job.company}
                            </p>
                            <div className="flex items-center gap-4 text-md text-gray-600">
                              <span>{job.location}</span>
                              <span>•</span>
                              <span className="capitalize">
                                {job.workType.toLowerCase()}
                              </span>
                              <span>•</span>
                              <span>
                                RM {job.salaryMin?.toLocaleString()} - RM{" "}
                                {job.salaryMax?.toLocaleString()}
                              </span>
                            </div>
                          </div>
                          <Button
                            onClick={() => handleViewJob(job.jobId)}
                            className="bg-[var(--r-blue)] hover:bg-[var(--r-blue)]/80 text-white"
                          >
                            View Job
                          </Button>
                        </div>

                        <div className="mb-4">
                          <h4 className="font-medium text-[var(--r-boldgray)] mb-2 flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            Why this job matches you
                          </h4>
                          <p className="text-gray-700 leading-relaxed text-lg">
                            {job.explanation}
                          </p>
                        </div>

                        {job.keyStrengths && job.keyStrengths.length > 0 && (
                          <div className="mb-4">
                            <h4 className="font-medium text-[var(--r-boldgray)] mb-2">
                              Your Key Strengths for This Role
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {job.keyStrengths.map(
                                (strength: string, idx: number) => (
                                  <Badge
                                    key={idx}
                                    variant="outline"
                                    className="bg-green-50 text-green-700 border-green-200 text-md"
                                  >
                                    {strength}
                                  </Badge>
                                )
                              )}
                            </div>
                          </div>
                        )}

                        {job.potentialChallenges &&
                          job.potentialChallenges.length > 0 && (
                            <div>
                              <h4 className="font-medium text-[var(--r-boldgray)] mb-2">
                                Areas to Highlight
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {job.potentialChallenges.map(
                                  (challenge: string, idx: number) => (
                                    <Badge
                                      key={idx}
                                      variant="outline"
                                      className="bg-yellow-50 text-yellow-700 border-yellow-200 text-md"
                                    >
                                      {challenge}
                                    </Badge>
                                  )
                                )}
                              </div>
                            </div>
                          )}
                      </CardContent>
                    </Card>
                  )
                )
              )}
            </div>
          </ScrollArea>
        ) : (
          <div className="flex flex-col justify-center items-center h-full text-center text-[var(--r-boldgray)]">
            <HiMiniSparkles className="h-16 w-16 mb-4 text-gray-400" />
            <h3 className="text-xl font-medium mb-2">
              Ready to Find Your Dream Job?
            </h3>
            <p className="text-gray-600 max-w-md">
              Select your resume and customize your search preferences to
              discover personalized job recommendations powered by AI.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
