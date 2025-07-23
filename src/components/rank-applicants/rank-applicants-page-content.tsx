"use client";

import { useState } from "react";
import { JobSelectionForm } from "./job-selection-form";
import { CandidateRankingResults } from "./candidate-ranking-results";
import { RankApplicantsFilters } from "./rank-applicants-filters";
import { Separator } from "@/components/ui/separator";
import { useRankApplicants } from "@/hooks/use-rank-applicants";
import { HiMiniSparkles } from "react-icons/hi2";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { RankApplicantsRequest } from "@/schema/rank-applicants-schema";

export function RankApplicantsPageContent() {
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [filters, setFilters] = useState<{
    amount: number;
    localOnly?: boolean;
    profession?: string;
  }>({
    amount: 3,
    localOnly: false,
    profession: "",
  });
  const [shouldRank, setShouldRank] = useState(false);

  const searchRequest = selectedJobId
    ? {
        jobId: selectedJobId,
        amount: filters.amount,
        localOnly: filters.localOnly,
        profession: filters.profession,
      }
    : null;

  const { data: rankingResults, isLoading: isLoadingResults } =
    useRankApplicants({
      request: searchRequest as RankApplicantsRequest,
      enabled: shouldRank && !!searchRequest,
    });

  const handleJobSelect = (jobId: string) => {
    setSelectedJobId(jobId);
    setShouldRank(false);
  };

  const handleFiltersChange = (newFilters: {
    amount?: number;
    localOnly?: boolean;
    profession?: string;
  }) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
    }));
  };

  const handleSearch = () => {
    if (!selectedJobId) {
      toast.error("Please select a job posting first");
      return;
    }
    setShouldRank(true);
  };

  const handleReset = () => {
    setSelectedJobId("");
    setFilters({
      amount: 3,
      localOnly: false,
      profession: "",
    });
    setShouldRank(false);
  };

  return (
    <div className="flex flex-row">
      {/* Left Panel - Form */}
      <div className="min-w-1/4 max-w-1/4 bg-white p-8 border-r-1 border-[var(--r-darkgray)] max-h-[calc(100vh-6.5rem)] min-h-[calc(100vh-6.5rem)] overflow-y-auto">
        <div className="flex flex-col gap-6 font-libertinus">
          <div className="text-xl font-dm-serif text-[var(--r-boldgray)] mb-2">
            Find the Best Applicant for Your Job
          </div>
          <div className="text-md text-gray-600 mb-4">
            Select a job posting and configure your analysis preferences to rank
            and evaluate candidates using AI-powered insights.
          </div>

          {/* Job Selection */}
          <div>
            <JobSelectionForm
              selectedJobId={selectedJobId}
              onJobSelect={handleJobSelect}
            />
          </div>

          <Separator />

          {/* Filters */}
          {selectedJobId && (
            <>
              <div className="text-lg font-dm-serif text-[var(--r-boldgray)]">
                Analysis Options
              </div>
              <RankApplicantsFilters
                filters={filters}
                onFiltersChange={handleFiltersChange}
                onSearch={handleSearch}
                isLoading={isLoadingResults}
                canSearch={!!selectedJobId}
                showButton={false}
              />

              {/* Action Buttons */}
              <div className="flex gap-4 mt-6">
                <button
                  onClick={handleSearch}
                  disabled={isLoadingResults || !selectedJobId}
                  className="flex-1 bg-[var(--r-blue)] hover:bg-[var(--r-blue)]/80 text-white font-dm-serif h-12 rounded-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isLoadingResults ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <HiMiniSparkles className="h-4 w-4 mr-2" />
                      Rank Candidates
                    </>
                  )}
                </button>
                <button
                  onClick={handleReset}
                  className="h-12 px-6 text-[var(--r-boldgray)] border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Reset
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Right Panel - Results */}
      <div className="flex-1 flex flex-col bg-white font-libertinus">
        {isLoadingResults ? (
          <div className="flex flex-col justify-center items-center h-full text-center">
            <Loader2 className="h-12 w-12 animate-spin text-[var(--r-blue)] mb-4" />
            <h3 className="text-xl font-medium mb-2">Analyzing Candidates</h3>
            <p className="text-gray-600">
              Our AI is evaluating applicants and ranking them based on job
              requirements...
            </p>
          </div>
        ) : rankingResults ? (
          <CandidateRankingResults results={rankingResults} />
        ) : (
          <div className="flex flex-col justify-center items-center h-full text-center text-[var(--r-boldgray)]">
            <HiMiniSparkles className="h-16 w-16 mb-4 text-gray-400" />
            <h3 className="text-xl font-medium mb-2">
              Ready to Rank Your Candidates?
            </h3>
            <p className="text-gray-600 max-w-md">
              Select a job posting and configure your analysis preferences to
              discover the best candidates for your position.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
