"use client";

import { useJobApplication } from "@/hooks/use-job-application";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FiMapPin } from "react-icons/fi";
import { IoCashOutline } from "react-icons/io5";
import { cn } from "@/lib/utils";
import { cleanFilename } from "@/lib/utils/clean-filename";
import { Separator } from "../ui/separator";
import { useRouter } from "next/navigation";
import { pages } from "@/config/directory";

interface MyJobApplicationContentProps {
  applicationId: string;
}

export default function MyJobApplicationContent({
  applicationId,
}: MyJobApplicationContentProps) {
  const { data, isLoading, error } = useJobApplication(applicationId);
  const router = useRouter();

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
  const app = data.application;
  const job = app.job;
  const company = job.company;
  const jobSeeker = app.jobSeeker;
  const resume = app.resume;

  // Helper for initials fallback
  function getInitials(name: string | null | undefined) {
    if (!name) return "?";
    const parts = name.split(" ");
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  // Helper for status badge color
  function statusBadgeColor(status: string) {
    switch (status) {
      case "APPLIED":
        return "bg-blue-100 text-blue-800";
      case "REVIEWING":
        return "bg-yellow-100 text-yellow-800";
      case "SHORTLISTED":
        return "bg-purple-100 text-purple-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      case "SUCCESS":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  }

  // Helper for formatting status
  function formatStatus(status: string) {
    return status.charAt(0) + status.slice(1).toLowerCase().replace(/_/g, " ");
  }

  // Truncate job description
  function truncate(str: string, n: number) {
    return str.length > n ? str.slice(0, n - 1) + "…" : str;
  }

  return (
    <div className="flex flex-col md:flex-row gap-8 px-8 py-12 justify-center font-libertinus bg-[var(--r-gray)] max-h-[calc(100vh-7rem)] overflow-y-auto">
      {/* Left: Job Card & Actions */}
      <div className="w-full md:w-1/4 flex flex-col items-center gap-6">
        <Card className="w-full rounded-xl shadow-md">
          <CardContent className="px-8 py-4 flex flex-col items-center">
            {/* Company Logo */}
            <div className="w-16 h-16 rounded-full bg-[var(--r-darkgray)] flex items-center justify-center mb-4 overflow-hidden">
              {company.profilePicture ? (
                <img
                  src={company.profilePicture}
                  alt={company.name + " logo"}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <span className="font-bold text-xl text-[var(--r-blue)]">
                  {getInitials(company.name)}
                </span>
              )}
            </div>
            <div className="text-2xl font-dm-serif text-[var(--r-black)] mb-2 text-center">
              {job.title}
            </div>
            <div className="text-lg text-[var(--r-boldgray)] mb-4">
              {company.name}
            </div>
            <div className="text-black mb-4 text-center">
              {truncate(job.description ?? "", 120)}
            </div>
            <div className="flex gap-2 mb-4">
              <Badge
                variant="secondary"
                className={cn(
                  job.status === "HIRING"
                    ? "bg-green-100 text-green-800"
                    : job.status === "URGENTLY_HIRING"
                    ? "bg-red-100 text-red-800"
                    : job.status === "CLOSED"
                    ? "bg-slate-200 text-slate-600"
                    : job.status === "CLOSED_BY_ADMIN"
                    ? "bg-zinc-300 text-zinc-700"
                    : "",
                  "p-2"
                )}
              >
                {formatStatus(job.status)}
              </Badge>
              <Badge
                variant="secondary"
                className={cn(
                  job.workType === "ONSITE"
                    ? "bg-yellow-100 text-yellow-800"
                    : job.workType === "REMOTE"
                    ? "bg-blue-100 text-blue-800"
                    : job.workType === "HYBRID"
                    ? "bg-purple-100 text-purple-800"
                    : "",
                  "p-2"
                )}
              >
                {job.workType.charAt(0) + job.workType.slice(1).toLowerCase()}
              </Badge>
            </div>
            <div className="flex flex-col gap-2 text-black text-lg mb-4 items-center">
              <span className="text-[var(--r-boldgray)] flex items-center">
                <FiMapPin className="mr-2" />
                {job.country}
              </span>
              <span className="text-[var(--r-boldgray)] flex items-center">
                <IoCashOutline className="mr-2" />
                {job.salaryMin && job.salaryMax
                  ? `RM${job.salaryMin.toLocaleString()} - RM${job.salaryMax.toLocaleString()}`
                  : "-"}
              </span>
            </div>
          </CardContent>
        </Card>
        <Button className="w-full h-12 text-lg  bg-[var(--r-blue)] text-white hover:bg-[var(--r-blue)]/80 mt-4">
          Practice Interview Questions
        </Button>
        <Button className="w-full h-12 text-lg  bg-[var(--r-darkgray)] text-black hover:bg-red-400 hover:text-white">
          Withdraw Application
        </Button>
      </div>

      {/* Right: Application Details */}
      <div className="w-full md:w-2/3 flex flex-col gap-6">
        <Card className="rounded-xl shadow-md">
          <CardContent className="px-8 py-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
              <div>
                <div className="text-3xl font-dm-serif text-[var(--r-black)] mb-2">
                  Application Status
                </div>
                <div className="text-[var(--r-boldgray)] mb-2 text-lg">
                  Here are the details of your application
                </div>
              </div>
              <Badge
                variant="secondary"
                className={cn(
                  statusBadgeColor(app.status),
                  "py-2 px-4 text-lg"
                )}
              >
                {formatStatus(app.status)}
              </Badge>
            </div>
            <hr className="mb-6" />
            {/* Candidate Details */}
            <div className="mb-6">
              <div className="text-2xl font-dm-serif text-[var(--r-boldgray)] mb-4">
                Candidate Details
              </div>
              <div className="flex items-center gap-4 justify-between">
                <div className="flex gap-4 items-center">
                  <div className="w-16 h-16 rounded-full bg-[var(--r-darkgray)] flex items-center justify-center overflow-hidden">
                    {jobSeeker.profilePicture ? (
                      <img
                        src={jobSeeker.profilePicture}
                        alt={jobSeeker.firstName + " " + jobSeeker.lastName}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <span className="font-bold text-xl text-[var(--r-blue)]">
                        {getInitials(
                          jobSeeker.firstName + " " + jobSeeker.lastName
                        )}
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="font-dm-serif text-lg">
                      {jobSeeker.firstName} {jobSeeker.lastName}
                    </div>
                    <div className="text-[var(--r-boldgray)] text-lg">
                      {jobSeeker.profession ?? "-"}
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="ml-4"
                  onClick={() =>
                    router.push(`${pages.viewProfile}/${jobSeeker.userId}`)
                  }
                >
                  View Profile
                </Button>
              </div>
            </div>
            {/* Resume Submitted */}
            <div className="mb-6">
              <div className="text-2xl font-dm-serif text-[var(--r-boldgray)] mb-4 mt-8">
                Resume Submitted
              </div>
              <div className="flex items-center gap-4 justify-between">
                <span className="text-[var(--r-black)] text-lg">
                  {cleanFilename(resume.fileName)}
                </span>
                <Button
                  variant="outline"
                  onClick={() => window.open(resume.s3Url, "_blank")}
                >
                  View Resume
                </Button>
              </div>
            </div>
            {/* Cover Letter Submitted */}
            <div className="mb-6">
              <div className="text-2xl font-dm-serif text-[var(--r-boldgray)] mb-4 mt-8">
                Cover Letter Submitted
              </div>
              <div className="border-1 border-[var(--r-darkgray)] rounded-lg p-4 text-[var(--r-black)] min-h-[80px] whitespace-pre-line">
                {app.coverLetter ? (
                  app.coverLetter
                ) : (
                  <span className="text-gray-400">
                    No cover letter submitted.
                  </span>
                )}
              </div>
            </div>
            {/* Message from Recruiter */}
            <div>
              <div className="text-2xl font-dm-serif text-[var(--r-boldgray)] mb-4 mt-8">
                Message from Recruiter
              </div>
              <div className="border-1 border-[var(--r-darkgray)] rounded-lg p-4 text-[var(--r-black)] min-h-[80px] whitespace-pre-line">
                {app.feedback ? (
                  app.feedback
                ) : (
                  <span className="text-gray-400">No feedback yet.</span>
                )}
              </div>
            </div>
            <hr className="mb-6 mt-12" />
            {/* Additional Information */}
            <div className="text-2xl font-dm-serif text-[var(--r-boldgray)] mb-4 mt-8">
              Additional Information
            </div>
            <div className="text-[var(--r-black)] text-lg flex justify-between">
              <div className="flex items-center">
                <p className="mr-2">Application ID: </p>
                <p className="text-[var(--r-boldgray)]">{app.id}</p>
              </div>
              <div className="flex items-center">
                <p className="mr-2">Applied on:</p>
                <p className="text-[var(--r-boldgray)]">
                  {new Date(app.appliedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div className="flex items-center">
                <p className="mr-2">Last Updated:</p>
                <p className="text-[var(--r-boldgray)]">
                  {new Date(app.updatedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Separator className="bg-transparent" />
      </div>
    </div>
  );
}
