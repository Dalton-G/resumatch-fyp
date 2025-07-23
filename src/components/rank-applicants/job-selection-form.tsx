"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useJobsWithApplicants } from "@/hooks/use-jobs-with-applicants";

interface JobSelectionFormProps {
  selectedJobId: string;
  onJobSelect: (jobId: string) => void;
}

export function JobSelectionForm({
  selectedJobId,
  onJobSelect,
}: JobSelectionFormProps) {
  const { data: jobsWithApplicants = [], isLoading: isLoadingJobs } =
    useJobsWithApplicants();

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label
          htmlFor="job-select"
          className="text-sm font-libertinus text-[var(--r-boldgray)]"
        >
          Select Job Posting *
        </label>
        <Select
          value={selectedJobId}
          onValueChange={onJobSelect}
          disabled={isLoadingJobs}
        >
          <SelectTrigger id="job-select" className="w-full mt-2 text-lg">
            <SelectValue
              placeholder={
                isLoadingJobs
                  ? "Loading jobs..."
                  : "Select a job posting to analyze"
              }
            />
          </SelectTrigger>
          <SelectContent>
            {jobsWithApplicants.map((job) => (
              <SelectItem key={job.id} value={job.id}>
                <div className="flex justify-between items-center w-full">
                  <span className="font-libertinus text-md">{job.title}</span>
                  <span className="text-sm text-muted-foreground ml-2">
                    {job.applicantCount} applicant
                    {job.applicantCount !== 1 ? "s" : ""}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
