import JobApplicantViewClient from "@/components/job-applicants/job-applicant-view-client";
import { ensureAuth } from "@/lib/utils/check-role";

interface ViewApplicantsPageProps {
  params: Promise<{ jobId: string }>;
}

export default async function ViewApplicantsPage({
  params,
}: ViewApplicantsPageProps) {
  const { jobId } = await params;
  return <JobApplicantViewClient jobId={jobId} />;
}
