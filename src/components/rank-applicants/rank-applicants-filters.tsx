"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProfessions } from "@/hooks/use-professions";

interface RankApplicantsFiltersProps {
  filters: {
    amount: number;
    localOnly?: boolean;
    profession?: string;
  };
  onFiltersChange: (filters: {
    amount?: number;
    localOnly?: boolean;
    profession?: string;
  }) => void;
  onSearch: () => void;
  isLoading?: boolean;
  canSearch: boolean;
}

export function RankApplicantsFilters({
  filters,
  onFiltersChange,
  onSearch,
  isLoading = false,
  canSearch,
}: RankApplicantsFiltersProps) {
  const [amount, setAmount] = useState(filters.amount);
  const [localOnly, setLocalOnly] = useState(filters.localOnly || false);
  const [profession, setProfession] = useState(filters.profession || "");

  const { data: professions = [] } = useProfessions();

  const handleAmountChange = (value: string) => {
    const newAmount = parseInt(value);
    setAmount(newAmount);
    onFiltersChange({ amount: newAmount });
  };

  const handleLocalOnlyChange = (checked: boolean) => {
    setLocalOnly(checked);
    onFiltersChange({ localOnly: checked });
  };

  const handleProfessionChange = (value: string) => {
    const newProfession = value === "all" ? "" : value;
    setProfession(newProfession);
    onFiltersChange({ profession: newProfession || undefined });
  };

  const resetFilters = () => {
    setAmount(3);
    setLocalOnly(false);
    setProfession("");
    onFiltersChange({
      amount: 3,
      localOnly: false,
      profession: undefined,
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Number of Top Candidates */}
        <div className="space-y-2">
          <Label className="font-dm-serif">Number of Top Candidates</Label>
          <Select
            value={amount.toString()}
            onValueChange={handleAmountChange}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select number of candidates" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Top 1 candidate</SelectItem>
              <SelectItem value="2">Top 2 candidates</SelectItem>
              <SelectItem value="3">Top 3 candidates</SelectItem>
              <SelectItem value="4">Top 4 candidates</SelectItem>
              <SelectItem value="5">Top 5 candidates</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Local Candidates Only */}
        <div className="space-y-2">
          <Label htmlFor="local-only" className="font-dm-serif">
            Local Candidates Only
          </Label>
          <div className="flex items-center space-x-2">
            <Switch
              id="local-only"
              checked={localOnly}
              onCheckedChange={handleLocalOnlyChange}
              disabled={isLoading}
            />
            <Label
              htmlFor="local-only"
              className="text-sm text-muted-foreground"
            >
              Same country only
            </Label>
          </div>
        </div>

        {/* Profession Filter */}
        <div className="space-y-2">
          <Label className="font-dm-serif">Filter by Profession</Label>
          <Select
            value={profession || "all"}
            onValueChange={handleProfessionChange}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="All professions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All professions</SelectItem>
              {professions.map((prof) => (
                <SelectItem key={prof} value={prof}>
                  {prof}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Search and Reset Actions */}
      <div className="flex justify-between items-center pt-4 border-t">
        <div className="text-sm text-muted-foreground">
          {localOnly || profession ? (
            <span>
              Active filters:{" "}
              {[
                localOnly && "Local only",
                profession && `Profession: ${profession}`,
              ]
                .filter(Boolean)
                .join(", ")}
            </span>
          ) : (
            <span>Showing top {amount} candidates</span>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={resetFilters}
            disabled={isLoading}
          >
            Reset Filters
          </Button>
          <Button
            onClick={onSearch}
            disabled={isLoading || !canSearch}
            className="min-w-[120px]"
          >
            {isLoading ? "Analyzing..." : "Analyze Candidates"}
          </Button>
        </div>
      </div>
    </div>
  );
}
