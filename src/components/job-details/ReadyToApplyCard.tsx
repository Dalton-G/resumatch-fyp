import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import React, { useState } from "react";
import ReportJobModal from "./ReportJobModal";

interface ReadyToApplyCardProps {
  jobId: string;
  jobTitle: string;
  companyName: string;
  applicationCount: number;
  hasApplied: boolean;
  onApply: () => void;
}

export function ReadyToApplyCard({
  jobId,
  jobTitle,
  companyName,
  applicationCount,
  hasApplied,
  onApply,
}: ReadyToApplyCardProps) {
  const [showReportModal, setShowReportModal] = useState(false);

  return (
    <>
      <Card className="p-0">
        <CardContent className="p-6 flex flex-col gap-4">
          <div className="font-dm-serif text-2xl">Ready to Apply?</div>
          <div className="text-lg mb-2">
            Join {companyName} and take your career to the next level.
          </div>
          <div className="text-lg flex justify-between items-center">
            <div>Current Application:</div>
            <span>{applicationCount}</span>
          </div>
          <Button
            className="bg-[var(--r-blue)] hover:bg-[var(--r-blue)]/80 text-white w-full text-md mt-4"
            disabled={hasApplied}
            onClick={onApply}
          >
            {hasApplied ? "Already Applied" : "Apply Now"}
          </Button>

          {/* Report Job Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowReportModal(true)}
            className="w-full text-gray-600 hover:text-red-600 hover:border-red-300 text-md font-libertinus"
          >
            Report Job
          </Button>
        </CardContent>
      </Card>

      <ReportJobModal
        jobId={jobId}
        jobTitle={jobTitle}
        companyName={companyName}
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
      />
    </>
  );
}
