"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  EyeIcon,
  FileTextIcon,
  Star,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TbVectorSpline } from "react-icons/tb";
import type {
  RankApplicantsResponse,
  RankedCandidate,
} from "@/schema/rank-applicants-schema";
import { pages } from "@/config/directory";

type SortBy = "ai-score" | "embedding-score";

interface CandidateRankingResultsProps {
  results: RankApplicantsResponse;
}

export function CandidateRankingResults({
  results,
}: CandidateRankingResultsProps) {
  const router = useRouter();
  const [sortBy, setSortBy] = useState<SortBy>("ai-score");
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  const toggleCardExpansion = (jobSeekerId: string) => {
    setExpandedCards((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(jobSeekerId)) {
        newSet.delete(jobSeekerId);
      } else {
        newSet.add(jobSeekerId);
      }
      return newSet;
    });
  };

  const getSortedCandidates = () => {
    return [...results.candidates].sort((a, b) => {
      if (sortBy === "ai-score") {
        if (b.aiScore !== a.aiScore) {
          return b.aiScore - a.aiScore;
        }
        return b.embeddingScore - a.embeddingScore;
      } else {
        if (b.embeddingScore !== a.embeddingScore) {
          return b.embeddingScore - a.embeddingScore;
        }
        return b.aiScore - a.aiScore;
      }
    });
  };

  const formatScore = (score: number) => {
    return `${Math.round(score * 100)}%`;
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const sortedCandidates = getSortedCandidates();

  return (
    <div className="space-y-6">
      {/* Results Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl font-dm-serif">
                Candidate Analysis Results
              </CardTitle>
              <CardDescription>
                {results.jobTitle} at {results.jobCompany}
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-2xl font-dm-serif text-primary">
                {results.totalCandidates}
              </div>
              <div className="text-sm text-muted-foreground font-libertinus">
                candidate{results.totalCandidates !== 1 ? "s" : ""} analyzed
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Sorting Controls */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-dm-serif">Ranked Candidates</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground font-libertinus">
            Sort by:
          </span>
          <Select
            value={sortBy}
            onValueChange={(value: SortBy) => setSortBy(value)}
          >
            <SelectTrigger className="w-[180px] bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ai-score">AI Analysis Score</SelectItem>
              <SelectItem value="embedding-score">Similarity Score</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Candidate Cards */}
      <div className="space-y-4">
        {sortedCandidates.map((candidate, index) => {
          const isExpanded = expandedCards.has(candidate.jobSeekerId);

          return (
            <Card key={candidate.jobSeekerId} className="overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    {/* Rank Number */}
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-dm-serif">
                      {index + 1}
                    </div>

                    {/* Avatar and Name */}
                    <div className="flex items-center gap-3">
                      <Avatar>
                        {candidate.profilePicture && (
                          <AvatarImage
                            src={candidate.profilePicture}
                            alt={`${candidate.name}'s profile picture`}
                          />
                        )}
                        <AvatarFallback>
                          {getInitials(candidate.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-dm-serif">{candidate.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground font-libertinus">
                          {candidate.profession && (
                            <span>{candidate.profession}</span>
                          )}
                          {candidate.profession && candidate.country && (
                            <span>•</span>
                          )}
                          {candidate.country && (
                            <span>{candidate.country}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Scores and Actions */}
                  <div className="flex items-center gap-3">
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
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          router.push(
                            pages.viewApplication(candidate.applicationId)
                          )
                        }
                      >
                        <EyeIcon className="h-4 w-4" />
                      </Button>

                      <Collapsible
                        open={isExpanded}
                        onOpenChange={() =>
                          toggleCardExpansion(candidate.jobSeekerId)
                        }
                      >
                        <CollapsibleTrigger asChild>
                          <Button variant="outline" size="sm">
                            {isExpanded ? (
                              <ChevronUpIcon className="h-4 w-4" />
                            ) : (
                              <ChevronDownIcon className="h-4 w-4" />
                            )}
                          </Button>
                        </CollapsibleTrigger>
                      </Collapsible>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <Collapsible
                open={isExpanded}
                onOpenChange={() => toggleCardExpansion(candidate.jobSeekerId)}
              >
                <CollapsibleContent>
                  <CardContent className="pt-0 space-y-4">
                    {/* AI Analysis */}
                    <div className="space-y-3">
                      <h4 className="font-dm-serif text-sm text-muted-foreground uppercase tracking-wide">
                        AI Analysis
                      </h4>

                      <div className="prose prose-sm max-w-none">
                        <p className="text-sm leading-relaxed font-libertinus">
                          {candidate.analysis.reasoning}
                        </p>
                      </div>

                      {/* Key Strengths */}
                      {candidate.analysis.keyStrengths.length > 0 && (
                        <div>
                          <h5 className="font-dm-serif text-sm mb-2 text-green-700 dark:text-green-400">
                            Key Strengths
                          </h5>
                          <ul className="text-sm space-y-1 font-libertinus">
                            {candidate.analysis.keyStrengths.map(
                              (strength, idx) => (
                                <li
                                  key={idx}
                                  className="flex items-start gap-2"
                                >
                                  <span className="text-green-500 mt-1">•</span>
                                  <span>{strength}</span>
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )}

                      {/* Potential Concerns */}
                      {candidate.analysis.potentialConcerns.length > 0 && (
                        <div>
                          <h5 className="font-dm-serif text-sm mb-2 text-amber-700 dark:text-amber-400">
                            Potential Concerns
                          </h5>
                          <ul className="text-sm space-y-1 font-libertinus">
                            {candidate.analysis.potentialConcerns.map(
                              (concern, idx) => (
                                <li
                                  key={idx}
                                  className="flex items-start gap-2"
                                >
                                  <span className="text-amber-500 mt-1">•</span>
                                  <span>{concern}</span>
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          );
        })}
      </div>

      {/* No Results */}
      {results.totalCandidates === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-2">
              <FileTextIcon className="h-12 w-12 text-muted-foreground mx-auto" />
              <h3 className="font-dm-serif">No candidates found</h3>
              <p className="text-sm text-muted-foreground font-libertinus">
                No applicants match your current filters. Try adjusting your
                search criteria.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
