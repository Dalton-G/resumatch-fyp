"use client";

import { useCheckJobOwnership } from "@/hooks/use-check-job-ownership";
import { useJobApplicants } from "@/hooks/use-job-applicants";
import JobApplicantListHeading from "./job-applicant-list-heading";
import JobApplicantListBody from "./job-applicant-list-body";

interface JobApplicantViewClientProps {
  jobId: string;
  jobTitle: string;
}

export default function JobApplicantViewClient({
  jobId,
  jobTitle,
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
      <JobApplicantListHeading jobTitle={jobTitle} />
      <JobApplicantListBody jobApplicants={jobApplicants} />
    </div>
  );
}
