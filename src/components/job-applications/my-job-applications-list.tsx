"use client";

import { cacheKeys } from "@/config/cache-keys";
import { api } from "@/config/directory";
import { useMyJobApplications } from "@/hooks/use-my-job-applications";
import axiosInstance from "@/lib/axios";
import { JobViewResponse } from "@/lib/types/job-view-response";
import { JobApplication } from "@prisma/client";
import { useQueries } from "@tanstack/react-query";

export default function MyJobApplicationsList() {
  // 1. Fetch a list of job applications made by the user
  const {
    data: myJobApplications,
    isLoading: myJobApplicationsLoading,
    error: myJobApplicationsError,
  } = useMyJobApplications();

  const applications = myJobApplications as JobApplication[];

  const jobQueries = useQueries({
    queries:
      applications?.map((application) => ({
        queryKey: [cacheKeys.appliedJobDetails, application.jobId],
        queryFn: async () => {
          const { data } = await axiosInstance.get<JobViewResponse>(
            api.viewJobWithoutInc(application.jobId)
          );
          return data;
        },
        enabled: !!applications,
      })) ?? [],
  });

  const isLoadingJobs = jobQueries.some((q) => q.isLoading);
  const isErrorJobs = jobQueries.some((q) => q.isError);

  if (myJobApplicationsLoading || isLoadingJobs) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (myJobApplicationsError || isErrorJobs) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Error fetching job applications
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-2">My Job Applications</h1>
      {applications.length === 0 ? (
        <p>No job applications found.</p>
      ) : (
        <ul className="space-y-4">
          {applications.map((application, index) => {
            const jobData = jobQueries[index]?.data;
            if (!jobData) return null;

            return (
              <li key={application.id} className="border rounded p-4 shadow">
                <div className="text-lg font-semibold">{jobData.job.title}</div>
                <div className="text-sm text-gray-600">
                  {jobData.company.name} — {jobData.job.country}
                </div>
                <div className="text-sm mt-1">
                  Salary: ${jobData.job.salaryMin} - ${jobData.job.salaryMax}
                </div>
                <div className="text-sm mt-1">
                  Status: <strong>{application.status}</strong>
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Applied at:{" "}
                  {new Date(application.appliedAt).toLocaleDateString()}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
