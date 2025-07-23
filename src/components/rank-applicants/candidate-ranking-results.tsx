"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Target,
  ArrowUpDown,
  Star,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { TbVectorSpline } from "react-icons/tb";
import { FaInfoCircle } from "react-icons/fa";
import { MdAutoGraph } from "react-icons/md";
import type { RankApplicantsResponse } from "@/schema/rank-applicants-schema";
import { pages } from "@/config/directory";

type SortBy = "ai-score" | "embedding-score" | "average";

interface CandidateRankingResultsProps {
  results: RankApplicantsResponse;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function CandidateRankingResults({
  results,
}: CandidateRankingResultsProps) {
  const router = useRouter();
  const [sortBy, setSortBy] = useState<SortBy>("ai-score");

  const getSortedCandidates = () => {
    return [...results.candidates].sort((a, b) => {
      if (sortBy === "ai-score") {
        if (b.aiScore !== a.aiScore) {
          return b.aiScore - a.aiScore;
        }
        return b.embeddingScore - a.embeddingScore;
      } else if (sortBy === "embedding-score") {
        if (b.embeddingScore !== a.embeddingScore) {
          return b.embeddingScore - a.embeddingScore;
        }
        return b.aiScore - a.aiScore;
      } else {
        // "average" sorting
        const aAverage = (a.aiScore + a.embeddingScore) / 2;
        const bAverage = (b.aiScore + b.embeddingScore) / 2;
        if (bAverage !== aAverage) {
          return bAverage - aAverage;
        }
        return b.aiScore - a.aiScore; // fallback
      }
    });
  };

  const formatScore = (score: number) => {
    return `${Math.round(score * 100)}%`;
  };

  const sortedCandidates = getSortedCandidates();

  return (
    <ScrollArea className="h-[calc(100vh-6.5rem)] px-8 py-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Target className="h-6 w-6 text-[var(--r-blue)]" />
            <h2 className="text-2xl font-dm-serif text-[var(--r-boldgray)]">
              Candidate Rankings ({results.totalCandidates})
            </h2>
          </div>

          {/* Sort Options */}
          {results.totalCandidates > 0 && (
            <div className="flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4 text-gray-600" />
              <Select
                value={sortBy}
                onValueChange={(value: SortBy) => setSortBy(value)}
              >
                <SelectTrigger className="w-[180px] bg-white text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ai-score">
                    <div className="flex items-center gap-2">
                      <Star className="h-3 w-3" />
                      AI Analysis Score
                    </div>
                  </SelectItem>
                  <SelectItem value="embedding-score">
                    <div className="flex items-center gap-2">
                      <TbVectorSpline className="h-3 w-3" />
                      Similarity Score
                    </div>
                  </SelectItem>
                  <SelectItem value="average">
                    <div className="flex items-center gap-2">
                      <MdAutoGraph className="h-3 w-3" />
                      Average Score
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              {/* Info Dialog Button */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-gray-100"
                  >
                    <FaInfoCircle className="h-4 w-4 text-gray-500" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="min-w-3xl font-libertinus">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-2xl font-dm-serif font-normal mb-4">
                      Candidate Scoring System
                    </AlertDialogTitle>
                    <AlertDialogDescription asChild>
                      <div className="space-y-4 text-base">
                        <div className="border rounded-lg p-4 bg-blue-50">
                          <div className="flex items-center gap-2 mb-2">
                            <Star className="h-4 w-4 text-blue-600" />
                            <h3 className="font-dm-serif text-blue-900">
                              AI Analysis Score
                            </h3>
                          </div>
                          <p className="text-blue-800">
                            An AI-generated compatibility rating (0-100%) that
                            analyzes how well each candidate's skills,
                            experience, and background align with your job
                            requirements. This score considers technical skills,
                            relevant experience, education, and role-specific
                            qualifications.
                          </p>
                        </div>

                        <div className="border rounded-lg p-4 bg-gray-50">
                          <div className="flex items-center gap-2 mb-2">
                            <TbVectorSpline className="h-4 w-4 text-gray-600" />
                            <h3 className="font-dm-serif text-gray-900">
                              Similarity Score
                            </h3>
                          </div>
                          <p className="text-gray-800">
                            A mathematical similarity score (0-100%) that
                            measures how closely each candidate's resume content
                            matches your job description using vector embeddings
                            and natural language processing.
                          </p>
                        </div>

                        <div className="border rounded-lg p-4 bg-green-50">
                          <div className="flex items-center gap-2 mb-2">
                            <MdAutoGraph className="h-4 w-4 text-green-600" />
                            <h3 className="font-dm-serif text-green-900">
                              Average Score
                            </h3>
                          </div>
                          <p className="text-green-800">
                            A balanced combination of both AI Analysis and
                            Similarity scores, calculated as their arithmetic
                            mean. This provides a comprehensive ranking that
                            balances AI insights with semantic matching.
                          </p>
                        </div>

                        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-sm text-yellow-800">
                            <strong className="font-dm-serif font-normal text-md">
                              Recruiter Tip:
                            </strong>{" "}
                            While higher scores often indicate better matches,
                            consider reviewing candidates across different score
                            ranges to identify hidden talent and diverse
                            perspectives.
                          </p>
                        </div>
                      </div>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="mt-4 flex justify-end">
                    <AlertDialogCancel>Close</AlertDialogCancel>
                  </div>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>

        {/* Results Summary */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-blue-800 font-libertinus">
            Analyzed {results.totalCandidates} candidate
            {results.totalCandidates !== 1 ? "s" : ""} for {results.jobTitle} at{" "}
            {results.jobCompany}
          </p>
        </div>

        {results.totalCandidates === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium mb-2">No Candidates Found</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              No applicants match your current criteria. Try adjusting your
              search filters or check back later for new applications.
            </p>
          </div>
        ) : (
          sortedCandidates.map((candidate, index) => (
            <Card
              key={candidate.jobSeekerId}
              className="rounded-xl shadow-lg border-2 hover:shadow-xl transition-shadow"
            >
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-4 flex-1">
                    {/* Rank Number */}
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[var(--r-blue)] text-primary-foreground text-sm font-dm-serif flex-shrink-0">
                      {index + 1}
                    </div>

                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      <Avatar className="w-16 h-16">
                        {candidate.profilePicture && (
                          <AvatarImage
                            src={candidate.profilePicture}
                            alt={`${candidate.name}'s profile picture`}
                          />
                        )}
                        <AvatarFallback className="text-lg">
                          {getInitials(candidate.name)}
                        </AvatarFallback>
                      </Avatar>
                    </div>

                    {/* Candidate Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-2xl font-dm-serif text-[var(--r-boldgray)]">
                          {candidate.name}
                        </h3>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="secondary"
                            className={`text-md ${
                              sortBy === "ai-score"
                                ? "bg-[var(--r-blue)]/20 text-[var(--r-blue)] ring-2 ring-[var(--r-blue)]/30"
                                : "bg-[var(--r-blue)]/10 text-[var(--r-blue)]"
                            }`}
                          >
                            <Star className="h-3 w-3 mr-1" />
                            AI Match: {formatScore(candidate.aiScore)}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={`text-md ${
                              sortBy === "embedding-score"
                                ? "bg-gray-100 text-gray-700 border-gray-400 ring-2 ring-gray-300"
                                : "bg-gray-50 text-gray-600 border-gray-300"
                            }`}
                          >
                            <TbVectorSpline className="h-3 w-3 mr-1" />
                            Embedding: {formatScore(candidate.embeddingScore)}
                          </Badge>
                          {sortBy === "average" && (
                            <Badge
                              variant="secondary"
                              className="text-md bg-green-100 text-green-700 border-green-300 ring-2 ring-green-200"
                            >
                              <MdAutoGraph className="h-3 w-3 mr-1" />
                              Average:{" "}
                              {Math.round(
                                ((candidate.aiScore +
                                  candidate.embeddingScore) /
                                  2) *
                                  100
                              )}
                              %
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-md text-gray-600 mb-2">
                        {candidate.profession && (
                          <span>{candidate.profession}</span>
                        )}
                        {candidate.profession && candidate.country && (
                          <span>•</span>
                        )}
                        {candidate.country && <span>{candidate.country}</span>}
                      </div>
                    </div>
                  </div>

                  {/* View Application Button */}
                  <Button
                    onClick={() =>
                      router.push(
                        pages.viewApplication(candidate.applicationId)
                      )
                    }
                    className="bg-[var(--r-blue)] hover:bg-[var(--r-blue)]/80 text-white"
                  >
                    View Application
                  </Button>
                </div>

                {/* AI Analysis */}
                <div className="mb-4">
                  <h4 className="font-medium text-[var(--r-boldgray)] mb-2 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    AI Analysis
                  </h4>
                  <p className="text-gray-700 leading-relaxed text-lg font-libertinus">
                    {candidate.analysis.reasoning}
                  </p>
                </div>

                {/* Key Strengths */}
                {candidate.analysis.keyStrengths.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium text-[var(--r-boldgray)] mb-2">
                      Key Strengths
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {candidate.analysis.keyStrengths.map((strength, idx) => (
                        <Badge
                          key={idx}
                          variant="outline"
                          className="bg-green-50 text-green-700 border-green-200 text-md"
                        >
                          {strength}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Potential Concerns */}
                {candidate.analysis.potentialConcerns.length > 0 && (
                  <div>
                    <h4 className="font-medium text-[var(--r-boldgray)] mb-2">
                      Areas to Consider
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {candidate.analysis.potentialConcerns.map(
                        (concern, idx) => (
                          <Badge
                            key={idx}
                            variant="outline"
                            className="bg-yellow-50 text-yellow-700 border-yellow-200 text-md"
                          >
                            {concern}
                          </Badge>
                        )
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </ScrollArea>
  );
}
