"use client";

import { useJobDetailsForApplications } from "@/hooks/use-job-details-for-applications";
import { useMyJobApplications } from "@/hooks/use-my-job-applications";
import { JobApplication } from "@prisma/client";

export default function MyJobApplicationsList() {
  const {
    data: myJobApplications,
    isLoading: myJobApplicationsLoading,
    error: myJobApplicationsError,
  } = useMyJobApplications();

  if (myJobApplicationsLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading...
      </div>
    );
  }
  if (myJobApplicationsError) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Error fetching job applications
      </div>
    );
  }

  const applications = myJobApplications as JobApplication[];
  const jobDetailsQueries = useJobDetailsForApplications(applications);

  return (
    <div>
      <h1>My Job Applications</h1>
      <p>This page will list all job applications made by the user.</p>
      {applications && applications.length > 0 ? (
        <ul>
          {applications.map((application, idx) => {
            const jobDetails = jobDetailsQueries[idx]?.data;
            return (
              <li key={application.id}>
                <div>Application ID: {application.id}</div>
                <div>Job ID: {application.jobId}</div>
                <div>Resume ID: {application.resumeId}</div>
                <div>Status: {application.status}</div>
                <div>Cover Letter: {application.coverLetter}</div>
                <div>
                  Job Details:{" "}
                  {jobDetails ? JSON.stringify(jobDetails) : "Loading..."}
                </div>
                <hr />
              </li>
            );
          })}
        </ul>
      ) : (
        <p>No job applications found.</p>
      )}
    </div>
  );
}
