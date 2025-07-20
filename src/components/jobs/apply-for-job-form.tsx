"use client";

import { useJobDetails } from "@/hooks/use-job-details";
import { useMyResume } from "@/hooks/use-my-resume";
import { JobViewResponse } from "@/lib/types/job-view-response";
import { cleanFilename } from "@/lib/utils/clean-filename";
import { Resume } from "@prisma/client";

interface ApplyForJobFormProps {
  jobId: string;
}

export default function ApplyForJobForm({ jobId }: ApplyForJobFormProps) {
  // Fetch the user's resume list
  const {
    data: resumeList,
    isLoading: isLoadingResumes,
    isError: isErrorResumes,
  } = useMyResume();

  // Fetch the job details including company information
  const {
    data: jobDetails,
    isLoading: isLoadingJobDetails,
    isError: isErrorJobDetails,
  } = useJobDetails(jobId);

  // Making resume type-safe by asserting the type of resumeList
  const resumes = resumeList as Resume[] | undefined;

  // Making job details type-safe by asserting the type
  const jobDetail = jobDetails as JobViewResponse | undefined;

  return (
    <div>
      <div>Job ID: {jobId}</div>
      {resumes && resumes.length > 0 ? (
        <ul>
          {resumes.map((resume: Resume) => (
            <li key={resume.id}>{cleanFilename(resume.fileName)}</li>
          ))}
        </ul>
      ) : (
        <div>No resumes found</div>
      )}
      {jobDetail ? (
        <div>
          <h2>Job Title: {jobDetail.job.title}</h2>
          <p>Company: {jobDetail.company.name}</p>
          <p>Description: {jobDetail.job.description}</p>
        </div>
      ) : (
        <div>Loading job details...</div>
      )}
      {/* Additional form elements for applying can be added here */}
    </div>
  );
}
