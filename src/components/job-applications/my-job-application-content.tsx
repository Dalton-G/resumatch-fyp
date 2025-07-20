"use client";

import { useJobApplication } from "@/hooks/use-job-application";

interface MyJobApplicationContentProps {
  applicationId: string;
}

export default function MyJobApplicationContent({
  applicationId,
}: MyJobApplicationContentProps) {
  const { data, isLoading, error } = useJobApplication(applicationId);

  if (isLoading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  if (error)
    return (
      <div className="flex items-center justify-center min-h-screen">
        Error loading application
      </div>
    );

  if (!data)
    return (
      <div className="flex items-center justify-center min-h-screen">
        No application found for this Application ID
      </div>
    );
  const application = data.application;

  return (
    <div>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-2">{application.job.title}</h2>
        <p className="text-gray-700 mb-4">
          Resume Link: {application.resume.s3Url}
        </p>
      </div>
    </div>
  );
}
