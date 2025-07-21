import { JobApplicantsResponse } from "@/lib/types/job-applicants-view-response";

interface JobApplicantListBodyProps {
  jobApplicants: JobApplicantsResponse;
}

export default function JobApplicantListBody({
  jobApplicants,
}: JobApplicantListBodyProps) {
  return <div>Job Application Length: {jobApplicants.length}</div>;
}
