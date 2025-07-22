"use client";

import { useState } from "react";
import { JobSelectionForm } from "./job-selection-form";
import { CandidateRankingResults } from "./candidate-ranking-results";
import { RankApplicantsFilters } from "./rank-applicants-filters";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useRankApplicants } from "@/hooks/use-rank-applicants";
import type {
  RankApplicantsRequest,
  RankApplicantsResponse,
} from "@/schema/rank-applicants-schema";

interface FormData {
  jobId: string;
  localOnly?: boolean;
  profession?: string;
}

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
  const [hasSearched, setHasSearched] = useState(false);

  const searchRequest = selectedJobId
    ? {
        jobId: selectedJobId,
        amount: filters.amount,
        localOnly: filters.localOnly,
        profession: filters.profession,
      }
    : null;

  const {
    data: rankingResults,
    isLoading: isLoadingResults,
    error: resultsError,
    refetch: refetchResults,
  } = useRankApplicants({
    request: searchRequest as RankApplicantsRequest,
    enabled: hasSearched && !!searchRequest,
  });

  const handleJobSelect = (jobId: string) => {
    setSelectedJobId(jobId);
    setHasSearched(false); // Reset search state when job changes
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
    if (selectedJobId) {
      setHasSearched(true);
      refetchResults();
    }
  };

  return (
    <div className="space-y-8">
      {/* Description */}
      <div className="space-y-2">
        <p className="text-muted-foreground font-libertinus">
          Use AI-powered analysis to rank and evaluate candidates for your job
          postings
        </p>
      </div>

      {/* Job Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="font-dm-serif">Select Job Posting</CardTitle>
          <CardDescription>
            Choose a job posting to analyze and rank its applicants
          </CardDescription>
        </CardHeader>
        <CardContent>
          <JobSelectionForm
            selectedJobId={selectedJobId}
            onJobSelect={handleJobSelect}
          />
        </CardContent>
      </Card>

      {/* Filters - Show when job is selected */}
      {selectedJobId && (
        <Card>
          <CardHeader>
            <CardTitle className="font-dm-serif">Search Options</CardTitle>
            <CardDescription>
              Configure your candidate search and analysis options
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RankApplicantsFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onSearch={handleSearch}
              isLoading={isLoadingResults}
              canSearch={!!selectedJobId}
            />
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isLoadingResults && (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center space-y-4">
              <LoadingSpinner className="h-8 w-8" />
              <div className="text-center space-y-1">
                <p className="font-dm-serif font-medium">
                  Analyzing candidates...
                </p>
                <p className="text-sm text-muted-foreground font-libertinus">
                  This may take a few moments as we process each applicant
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {resultsError && !isLoadingResults && (
        <Card className="border-destructive">
          <CardContent className="py-6">
            <div className="text-center space-y-2">
              <p className="font-dm-serif font-medium text-destructive">
                Error analyzing candidates
              </p>
              <p className="text-sm text-muted-foreground font-libertinus">
                {resultsError.message}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {rankingResults && !isLoadingResults && !resultsError && (
        <CandidateRankingResults results={rankingResults} />
      )}
    </div>
  );
}
