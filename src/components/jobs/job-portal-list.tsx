"use client";

import { useJobListings } from "@/hooks/use-job-listings";
import { useMemo, useState } from "react";
import { pages } from "@/config/directory";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { FiMapPin } from "react-icons/fi";
import { IoCashOutline } from "react-icons/io5";
import { FaRegEye } from "react-icons/fa";

const DESCRIPTION_PREVIEW_LENGTH = 120;

const workTypeOptions = [
  { value: "ONSITE", label: "Onsite" },
  { value: "REMOTE", label: "Remote" },
  { value: "HYBRID", label: "Hybrid" },
];
const jobStatusOptions = [
  { value: "URGENTLY_HIRING", label: "Urgently Hiring" },
  { value: "HIRING", label: "Hiring" },
  { value: "CLOSED", label: "Closed" },
  { value: "CLOSED_BY_ADMIN", label: "Closed by Admin" },
];

function truncate(str: string, n: number) {
  return str.length > n ? str.slice(0, n - 1) + "…" : str;
}

function getInitials(name: string) {
  if (!name) return "?";
  const parts = name.split(" ");
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

interface JobPortalListProps {
  userRole: "JOB_SEEKER" | "COMPANY" | "ADMIN";
}

export default function JobPortalList({ userRole }: JobPortalListProps) {
  const { data, isLoading, isError } = useJobListings();
  const [search, setSearch] = useState("");
  const [workType, setWorkType] = useState("");
  const [status, setStatus] = useState("");
  const router = useRouter();

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
    return jobs;
  }, [data, search, workType, status]);

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
        <Button
          variant="outline"
          className="h-12 px-6 mt-2 md:mt-0 !text-lg !text-[var(--r-boldgray)]"
          onClick={() => {
            setSearch("");
            setWorkType("");
            setStatus("");
          }}
        >
          Clear Filters
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
                {/* Company Profile Picture or Initials */}
                <div className="w-20 h-20 rounded-full bg-[var(--r-darkgray)] flex items-center justify-center text-3xl font-bold mr-8 overflow-hidden">
                  {job.company?.profilePicture ? (
                    <img
                      src={job.company.profilePicture}
                      alt={job.company.name}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <span>{getInitials(job.company?.name)}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap gap-2 mb-2 items-center">
                    <span className="text-2xl font-dm-serif text-[var(--r-black)] mr-2">
                      {job.title}
                    </span>
                    {/* JobStatus Badge with custom color */}
                    <Badge
                      variant="secondary"
                      className={
                        job.status === "URGENTLY_HIRING"
                          ? "bg-red-100 text-red-800"
                          : job.status === "HIRING"
                          ? "bg-green-100 text-green-800"
                          : job.status === "CLOSED"
                          ? "bg-slate-200 text-slate-600"
                          : job.status === "CLOSED_BY_ADMIN"
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
                        job.workType === "ONSITE"
                          ? "bg-yellow-100 text-yellow-800"
                          : job.workType === "REMOTE"
                          ? "bg-blue-100 text-blue-800"
                          : job.workType === "HYBRID"
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
                      <FaRegEye className="mr-1" /> {job.views} views
                    </span>
                  </div>
                  <div className="text-lg text-[var(--r-boldgray)]">
                    Posted:{" "}
                    {(() => {
                      const days = Math.floor(
                        (Date.now() - new Date(job.createdAt).getTime()) /
                          (1000 * 60 * 60 * 24)
                      );
                      return days === 0
                        ? "Today"
                        : `${days} day${days > 1 ? "s" : ""} ago`;
                    })()}
                  </div>
                </div>
                <div className="flex flex-col gap-4 md:ml-8 md:items-end">
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      toast.message(`clicked applied on job: ${job.id}`);
                    }}
                    className="bg-[var(--r-blue)] text-white w-40 text-md"
                    disabled={userRole === "COMPANY" || userRole === "ADMIN"}
                  >
                    Apply Now
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
