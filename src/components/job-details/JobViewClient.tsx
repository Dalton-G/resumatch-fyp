"use client";

import { cacheKeys } from "@/config/cache-keys";
import { api, pages } from "@/config/directory";
import { JobDetailCard } from "@/components/job-details/JobDetailCard";
import { JobStatisticsCard } from "@/components/job-details/JobStatisticsCard";
import { ReadyToApplyCard } from "@/components/job-details/ReadyToApplyCard";
import { AboutCompanyCard } from "@/components/job-details/AboutCompanyCard";
import { NotFoundJob } from "@/components/job-details/NotFoundJob";
import axios from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import React from "react";
import { useJobDetails } from "@/hooks/use-job-details";
import { useJobApplicationStatus } from "@/hooks/use-job-application-status";
import { UserRole } from "@prisma/client";

interface JobViewClientProps {
  jobId: string;
  userRole: string | null;
  userId: string | null;
}

export function JobViewClient({ jobId, userRole }: JobViewClientProps) {
  const router = useRouter();
  const { data, isLoading, isError } = useJobDetails(jobId);
  const { data: hasApplied, isLoading: isLoadingHasApplied } =
    useJobApplicationStatus(jobId, userRole === UserRole.JOB_SEEKER);

  const showApplyCard = userRole === UserRole.JOB_SEEKER;

  if (isLoading || isLoadingHasApplied)
    return <div className="p-8 text-center">Loading...</div>;
  if (isError || !data || !data.job || !data.company) return <NotFoundJob />;

  const { job, company, applicationCount } = data;

  return (
    <div className="flex flex-row gap-8 px-12 py-8 font-libertinus max-h-[calc(100vh-1rem)] overflow-y-auto justify-center">
      {/* Main Content */}
      <div className="flex-1 flex flex-col gap-6 max-w-5xl">
        <JobDetailCard
          job={{
            ...job,
            applicantCount: applicationCount,
          }}
          company={company}
        />
        <AboutCompanyCard
          company={company}
          onViewProfile={() =>
            router.push(pages.viewProfile + "/" + company.userId)
          }
        />
      </div>
      {/* Right Panel */}
      <div className="w-[480px] flex flex-col gap-6">
        <JobStatisticsCard
          views={job.views}
          applications={applicationCount}
          posted={job.createdAt}
          updated={job.updatedAt}
        />
        {showApplyCard &&
          (isLoadingHasApplied ? (
            <div className="p-4 text-center">
              Checking application status...
            </div>
          ) : (
            <ReadyToApplyCard
              companyName={company.name}
              applicationCount={applicationCount}
              hasApplied={!!hasApplied}
              onApply={() => router.push(pages.applyForJob(job.id))}
            />
          ))}
      </div>
    </div>
  );
}
