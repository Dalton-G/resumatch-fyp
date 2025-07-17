"use client";

import { useMyJobPostings } from "@/hooks/use-my-job-postings";
import EditJobForm from "@/components/edit/edit-job-form";
import Heading from "@/components/custom/heading";
import { use } from "react";

export default function EditJobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { data: jobs, isLoading } = useMyJobPostings();
  const { id } = use(params);
  const jobId = id;
  const job = jobs?.find((j: any) => j.id === jobId);

  if (isLoading) return <div className="p-8 text-center">Loading...</div>;
  if (!job)
    return <div className="p-8 text-center text-red-500">Job not found.</div>;

  return (
    <>
      <Heading title="Edit Job Posting" />
      <EditJobForm job={job} />
    </>
  );
}
