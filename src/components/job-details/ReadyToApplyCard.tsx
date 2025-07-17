import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import React from "react";

interface ReadyToApplyCardProps {
  companyName: string;
  applicationCount: number;
  hasApplied: boolean;
  onApply: () => void;
}

export function ReadyToApplyCard({
  companyName,
  applicationCount,
  hasApplied,
  onApply,
}: ReadyToApplyCardProps) {
  return (
    <Card className="p-0">
      <CardContent className="p-6 flex flex-col gap-4">
        <div className="font-bold text-xl">Ready to Apply?</div>
        <div className="text-base mb-2">
          Join {companyName} and take your career to the next level
        </div>
        <div className="text-base">
          Current Application:{" "}
          <span className="font-semibold">{applicationCount}</span>
        </div>
        <Button
          className="bg-[var(--r-blue)] text-white w-full text-md mt-4"
          disabled={hasApplied}
          onClick={onApply}
        >
          {hasApplied ? "Already Applied" : "Apply Now"}
        </Button>
      </CardContent>
    </Card>
  );
}
