"use client";

import { cacheKeys } from "@/config/cache-keys";
import { api, pages } from "@/config/directory";
import { useMyJobApplications } from "@/hooks/use-my-job-applications";
import axiosInstance from "@/lib/axios";
import { JobViewResponse } from "@/lib/types/job-view-response";
import { JobApplication } from "@prisma/client";
import { useQueries } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MdFilterAltOff } from "react-icons/md";
import { FiMapPin } from "react-icons/fi";
import { IoCashOutline } from "react-icons/io5";
import { FaRegClock } from "react-icons/fa";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";

export default function MyJobApplicationsList() {
  const {
    data: myJobApplications,
    isLoading: myJobApplicationsLoading,
    error: myJobApplicationsError,
  } = useMyJobApplications();

  const applications = myJobApplications as JobApplication[];
  const router = useRouter();

  // Status options (formatted)
  const statusOptions = [
    { value: "APPLIED", label: "Applied" },
    { value: "REVIEWING", label: "Reviewing" },
    { value: "SHORTLISTED", label: "Shortlisted" },
    { value: "REJECTED", label: "Rejected" },
    { value: "SUCCESS", label: "Success" },
  ];

  // Search/filter state
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  // Fetch job details for each application
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

  // Combine application and job data for filtering
  const combined = useMemo(() => {
    if (!applications || !jobQueries.length) return [];
    return applications
      .map((application, idx) => {
        const jobData = jobQueries[idx]?.data;
        return jobData
          ? {
              application,
              job: jobData.job,
              company: jobData.company,
            }
          : null;
      })
      .filter(Boolean);
  }, [applications, jobQueries]);

  // Truncate helper for description
  const DESCRIPTION_PREVIEW_LENGTH = 120;
  function truncate(str: string, n: number) {
    return str.length > n ? str.slice(0, n - 1) + "…" : str;
  }

  // Filter and search (ensure item is not null)
  const filtered = useMemo(() => {
    let list = combined.filter(
      (item): item is NonNullable<typeof item> => !!item
    );
    if (search) {
      const s = search.toLowerCase();
      list = list.filter(
        (item) =>
          item.job?.title?.toLowerCase().includes(s) ||
          item.company?.name?.toLowerCase().includes(s)
      );
    }
    if (status) {
      list = list.filter((item) => item.application.status === status);
    }
    return list;
  }, [combined, search, status]);

  if (myJobApplicationsLoading || isLoadingJobs) {
    return <div className="p-8 text-center">Loading...</div>;
  }
  if (myJobApplicationsError || isErrorJobs) {
    return (
      <div className="p-8 text-center text-red-500">
        Error fetching job applications
      </div>
    );
  }

  return (
    <div className="px-8 py-6 font-libertinus">
      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 items-center">
        <Input
          className="w-full bg-white !text-lg h-12"
          placeholder="Search jobs by title or company name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-full md:w-1/8 bg-white !text-lg min-h-12">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          className="h-12 px-6 mt-2 md:mt-0 !text-lg !text-[var(--r-boldgray)]"
          onClick={() => {
            setSearch("");
            setStatus("");
          }}
        >
          <MdFilterAltOff className="text-lg" />
        </Button>
      </div>

      {/* Applications List */}
      <div className="flex flex-col gap-6 overflow-y-auto max-h-[calc(100vh-14.3rem)]">
        {filtered.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            No job applications found.
          </div>
        ) : (
          filtered
            .filter((item): item is NonNullable<typeof item> => !!item)
            .map((item) => {
              const { application, job, company } = item;
              return (
                <Card
                  key={application.id}
                  className="p-0 cursor-pointer border-2 transition hover:border-[var(--r-blue)] hover:border-2 shadow-none hover:shadow-none"
                  onClick={() =>
                    router.push(pages.viewMyApplication(application.id))
                  }
                >
                  <CardContent className="p-8 flex md:flex-row md:items-center gap-4 relative">
                    {/* Company Profile Picture or Initials */}
                    <div className="flex flex-col h-[160px] items-center justify-start mr-4 -mt-4">
                      <div className="w-20 h-20 rounded-full bg-[var(--r-darkgray)] text-3xl font-bold overflow-hidden">
                        {company.profilePicture ? (
                          <img
                            src={company.profilePicture}
                            alt={company.name}
                            className="w-full h-full object-cover rounded-full"
                          />
                        ) : (
                          <span>{getInitials(company.name)}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col w-full">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap gap-2 mb-2 items-center">
                          <span className="text-2xl font-dm-serif text-[var(--r-black)] mr-2">
                            {job.title}
                          </span>
                          {/* Status Badge */}
                          <Badge
                            variant="secondary"
                            className={cn(
                              application.status === "APPLIED"
                                ? "bg-blue-100 text-blue-800"
                                : application.status === "REVIEWING"
                                ? "bg-yellow-100 text-yellow-800"
                                : application.status === "SHORTLISTED"
                                ? "bg-purple-100 text-purple-800"
                                : application.status === "REJECTED"
                                ? "bg-red-100 text-red-800"
                                : application.status === "SUCCESS"
                                ? "bg-green-100 text-green-800"
                                : "",
                              "p-2"
                            )}
                          >
                            {
                              statusOptions.find(
                                (opt) => opt.value === application.status
                              )?.label
                            }
                          </Badge>
                        </div>
                        <div className="text-[var(--r-boldgray)] mb-4 text-lg truncate max-w-full">
                          {company.name}
                        </div>
                        <div className="text-black mb-4 text-lg truncate max-w-full">
                          {truncate(
                            job.description ?? "",
                            DESCRIPTION_PREVIEW_LENGTH
                          )}
                        </div>
                        <div className="flex flex-wrap gap-12 items-center text-[var(--r-boldgray)] text-lg mb-4">
                          <span className="flex items-center gap-1">
                            <FiMapPin className="mr-1" /> {job.country}
                          </span>
                          <span className="flex items-center gap-1">
                            <IoCashOutline className="mr-1" />
                            {job.salaryMin && job.salaryMax
                              ? `RM${job.salaryMin.toLocaleString()} - RM${job.salaryMax.toLocaleString()}`
                              : "-"}
                          </span>
                          <span className="flex items-center gap-1">
                            <FaRegClock className="mr-1" />
                            {new Date(
                              application.appliedAt
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col min-h-[160px] items-center justify-end">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          // Placeholder action
                        }}
                        className="bg-[var(--r-blue)] text-white w-40 text-md hover:bg-[var(--r-blue)]/80"
                      >
                        Start Mock Interview
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
        )}
      </div>
    </div>
  );
}

// Helper to get initials from company name
function getInitials(name: string) {
  if (!name) return "?";
  const parts = name.split(" ");
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
