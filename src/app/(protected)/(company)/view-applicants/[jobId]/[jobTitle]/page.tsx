import JobApplicantViewClient from "@/components/job-applicants/job-applicant-view-client";

interface ViewApplicantsPageProps {
  params: Promise<{ jobId: string; jobTitle: string }>;
}

export default async function ViewApplicantsPage({
  params,
}: ViewApplicantsPageProps) {
  const { jobId, jobTitle } = await params;

  return (
    <JobApplicantViewClient
      jobId={jobId}
      jobTitle={decodeURIComponent(jobTitle)}
    />
  );
}
