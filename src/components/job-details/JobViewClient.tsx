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

interface JobViewClientProps {
  jobId: string;
  userRole: string | null;
  userId: string | null;
}

export function JobViewClient({ jobId, userRole }: JobViewClientProps) {
  const router = useRouter();
  const { data, isLoading, isError } = useQuery({
    queryKey: [cacheKeys.jobView, jobId],
    queryFn: async () => {
      const res = await axios.get(api.viewJob(jobId));
      return res.data;
    },
  });

  // Simulate hasApplied (should be replaced with real logic if needed)
  const hasApplied = false;

  if (isLoading) return <div className="p-8 text-center">Loading...</div>;
  if (isError || !data || !data.job || !data.company) return <NotFoundJob />;

  const { job, company, applicationCount } = data;

  return (
    <div className="flex flex-row gap-8 px-12 py-8 font-libertinus max-h-[calc(100vh-1rem)] overflow-y-auto">
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
        {userRole !== "COMPANY" && (
          <ReadyToApplyCard
            companyName={company.name}
            applicationCount={applicationCount}
            hasApplied={hasApplied}
            onApply={() => {}}
          />
        )}
      </div>
    </div>
  );
}
