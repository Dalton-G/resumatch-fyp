"use client";

import { useCheckJobOwnership } from "@/hooks/use-check-job-ownership";
import { useJobApplicants } from "@/hooks/use-job-applicants";

interface JobApplicantViewClientProps {
  jobId: string;
}

export default function JobApplicantViewClient({
  jobId,
}: JobApplicantViewClientProps) {
  const {
    data: ownsJobPosting,
    isLoading: isLoadingJobOwnership,
    isError: isErroredJobOwnership,
  } = useCheckJobOwnership({ jobId });

  // Always call hooks
  const {
    data: jobApplicants,
    isLoading: isLoadingJobApplicants,
    isError: isErrorJobApplicants,
  } = useJobApplicants(jobId);

  // Render logic
  if (isLoadingJobOwnership || isLoadingJobApplicants) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (isErroredJobOwnership) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Error checking job ownership
      </div>
    );
  }

  if (!ownsJobPosting) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        You do not have permission to view applicants for this job.
      </div>
    );
  }

  if (isErrorJobApplicants) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Error loading job applicants
      </div>
    );
  }

  if (!jobApplicants) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Something went wrong while fetching job applicants.
      </div>
    );
  }

  return (
    <div>
      You are authorized to view applicants and you have {jobApplicants.length}{" "}
      applicants.
    </div>
  );
}
