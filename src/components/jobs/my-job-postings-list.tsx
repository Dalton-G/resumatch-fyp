"use client";

import { useMyJobPostings } from "@/hooks/use-my-job-postings";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MdFilterAltOff } from "react-icons/md";
import { FaRegEdit, FaRegTrashAlt } from "react-icons/fa";
import { FiMapPin } from "react-icons/fi";
import { IoCashOutline } from "react-icons/io5";
import { FaRegEye } from "react-icons/fa";
import { GrGroup } from "react-icons/gr";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useMemo, useState } from "react";
import axios from "axios";
import { useQueryClient } from "@tanstack/react-query";
import { WorkType, JobStatus } from "@prisma/client";
import { useRouter } from "next/navigation";
import { pages } from "@/config/directory";
import { cacheKeys } from "@/config/cache-keys";

// Editable: max chars for description preview
const DESCRIPTION_PREVIEW_LENGTH = 120;

const workTypeOptions = [
  { value: WorkType.ONSITE, label: "Onsite" },
  { value: WorkType.REMOTE, label: "Remote" },
  { value: WorkType.HYBRID, label: "Hybrid" },
];
const jobStatusOptions = [
  { value: JobStatus.URGENTLY_HIRING, label: "Urgently Hiring" },
  { value: JobStatus.HIRING, label: "Hiring" },
  { value: JobStatus.CLOSED, label: "Closed" },
  { value: JobStatus.CLOSED_BY_ADMIN, label: "Closed by Admin" },
];
const sortOptions = [
  { value: "latest", label: "Latest" },
  { value: "views", label: "Most Views" },
  { value: "applicants", label: "Most Applicants" },
];

function truncate(str: string, n: number) {
  return str.length > n ? str.slice(0, n - 1) + "…" : str;
}

export default function MyJobPostingsList() {
  const { data, isLoading, isError } = useMyJobPostings();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [workType, setWorkType] = useState("");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState("latest");
  const [deletingJobId, setDeletingJobId] = useState<string | null>(null);

  const handleDelete = async (jobId: string) => {
    setDeletingJobId(jobId);
    try {
      await axios.delete(`/api/jobs/delete/${jobId}`);
      toast.success("Job deleted successfully.");
      queryClient.invalidateQueries({ queryKey: [cacheKeys.jobPostings] });
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Failed to delete job.");
    } finally {
      setDeletingJobId(null);
    }
  };

  const filtered = useMemo(() => {
    if (!data) return [];
    let jobs = [...data];
    if (search) {
      const s = search.toLowerCase();
      jobs = jobs.filter(
        (j) =>
          j.title.toLowerCase().includes(s) ||
          j.location.toLowerCase().includes(s)
      );
    }
    if (workType) jobs = jobs.filter((j) => j.workType === workType);
    if (status) jobs = jobs.filter((j) => j.status === status);
    if (sort === "views") jobs.sort((a, b) => b.views - a.views);
    else if (sort === "applicants")
      jobs.sort((a, b) => b.applicantCount - a.applicantCount);
    else
      jobs.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    return jobs;
  }, [data, search, workType, status, sort]);

  if (isLoading) return <div className="p-8 text-center">Loading...</div>;
  if (isError)
    return (
      <div className="p-8 text-center text-red-500">
        Failed to load job postings.
      </div>
    );

  return (
    <div className="px-8 py-6 font-libertinus">
      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 items-center">
        <Input
          className="w-full bg-white !text-lg h-12"
          placeholder="Search jobs by title or location"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-full md:w-1/8 bg-white !text-lg min-h-12">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {jobStatusOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={workType} onValueChange={setWorkType}>
          <SelectTrigger className="w-full md:w-1/8 bg-white !text-lg min-h-12">
            <SelectValue placeholder="Work Type" />
          </SelectTrigger>
          <SelectContent>
            {workTypeOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="w-full md:w-1/8 bg-white !text-lg min-h-12">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((opt) => (
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
            setWorkType("");
            setStatus("");
            setSort("latest");
          }}
        >
          <MdFilterAltOff className="text-lg" />
        </Button>
      </div>

      {/* Job Cards */}
      <div className="flex flex-col gap-6 overflow-y-auto max-h-[calc(100vh-14.3rem)]">
        {filtered.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            No job postings found.
          </div>
        ) : (
          filtered.map((job) => (
            <Card
              key={job.id}
              className="p-0 cursor-pointer border-2 transition hover:border-[var(--r-blue)] hover:border-2 shadow-none hover:shadow-none"
              onClick={(e) => {
                // Prevent card click when clicking on action buttons
                if ((e.target as HTMLElement).closest("button")) return;
                router.push(pages.viewJob(job.id));
              }}
            >
              <CardContent className="p-8 flex flex-col md:flex-row md:items-center gap-4 relative">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap gap-2 mb-2">
                    <span className="text-2xl font-dm-serif text-[var(--r-black)] mr-2">
                      {job.title}
                    </span>
                    {/* JobStatus Badge with custom color */}
                    <Badge
                      variant="secondary"
                      className={
                        job.status === JobStatus.URGENTLY_HIRING
                          ? "bg-red-100 text-red-800"
                          : job.status === JobStatus.HIRING
                          ? "bg-green-100 text-green-800"
                          : job.status === JobStatus.CLOSED
                          ? "bg-slate-200 text-slate-600"
                          : job.status === JobStatus.CLOSED_BY_ADMIN
                          ? "bg-zinc-300 text-zinc-700"
                          : ""
                      }
                    >
                      {job.status
                        .toLowerCase()
                        .split("_")
                        .map(
                          (word: string) =>
                            word.charAt(0).toUpperCase() + word.slice(1)
                        )
                        .join(" ")}
                    </Badge>
                    {/* WorkType Badge with custom color */}
                    <Badge
                      variant="secondary"
                      className={
                        job.workType === WorkType.ONSITE
                          ? "bg-yellow-100 text-yellow-800"
                          : job.workType === WorkType.REMOTE
                          ? "bg-blue-100 text-blue-800"
                          : job.workType === WorkType.HYBRID
                          ? "bg-purple-100 text-purple-800"
                          : ""
                      }
                    >
                      {job.workType.charAt(0) +
                        job.workType.slice(1).toLowerCase()}
                    </Badge>
                  </div>
                  <div className="text-[var(--r-boldgray)] mb-4 text-lg truncate max-w-full">
                    {truncate(job.description, DESCRIPTION_PREVIEW_LENGTH)}
                  </div>
                  <div className="flex flex-wrap gap-12 items-center text-black text-lg mb-4">
                    <span className="flex items-center gap-1">
                      <FiMapPin className="mr-1" /> {job.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <IoCashOutline className="mr-1" />
                      {job.salaryMin && job.salaryMax
                        ? `RM${job.salaryMin.toLocaleString()} - RM${job.salaryMax.toLocaleString()}`
                        : "-"}
                    </span>
                    <span className="flex items-center gap-1">
                      <GrGroup className="mr-1" /> {job.applicantCount}{" "}
                      applicants
                    </span>
                    <span className="flex items-center gap-1">
                      <FaRegEye className="mr-1" /> {job.views} views
                    </span>
                  </div>
                  <div className="text-lg text-[var(--r-boldgray)]">
                    Posted: {new Date(job.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex flex-col gap-12 md:ml-8 md:items-end">
                  <div className="flex gap-4 mb-2">
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(pages.editJob(job.id));
                      }}
                    >
                      <FaRegEdit />
                    </Button>
                    <Button
                      size="icon"
                      variant="destructive"
                      onClick={() => handleDelete(job.id)}
                      disabled={deletingJobId === job.id}
                    >
                      <FaRegTrashAlt />
                    </Button>
                  </div>
                  <Button
                    onClick={() =>
                      toast.message(`clicked view applicants on ${job.id}`)
                    }
                    className="bg-[var(--r-blue)] text-white w-40 text-md"
                  >
                    View Applicants
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
