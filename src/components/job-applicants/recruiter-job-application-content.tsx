"use client";

import { useJobApplication } from "@/hooks/use-job-application";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FiMapPin } from "react-icons/fi";
import { IoCashOutline } from "react-icons/io5";
import { cn } from "@/lib/utils";
import { api, pages } from "@/config/directory";
import axiosInstance from "@/lib/axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { cleanFilename } from "@/lib/utils/clean-filename";
import { Separator } from "../ui/separator";
import { ApplicationStatus } from "@prisma/client";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useQueryClient } from "@tanstack/react-query";
import { invalidateJobApplicationQueries } from "@/lib/utils/invalidate-cache";
import { RecruiterApplicationChatDialog } from "../chat/recruiter-application-chat-dialog";

interface RecruiterJobApplicationContentProps {
  applicationId: string;
}

const statusOptions = [
  { value: ApplicationStatus.APPLIED, label: "Applied" },
  { value: ApplicationStatus.REVIEWING, label: "Reviewing" },
  { value: ApplicationStatus.SHORTLISTED, label: "Shortlisted" },
  { value: ApplicationStatus.REJECTED, label: "Rejected" },
  { value: ApplicationStatus.SUCCESS, label: "Success" },
];

export default function RecruiterJobApplicationContent({
  applicationId,
}: RecruiterJobApplicationContentProps) {
  const { data, isLoading, error } = useJobApplication(applicationId);
  const router = useRouter();
  const [status, setStatus] = useState<string>("");
  const [feedback, setFeedback] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (data) {
      setStatus(data.application.status);
      setFeedback(data.application.feedback || "");
      setNotes(data.application.notes || "");
    }
  }, [data]);

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

  function getInitials(name: string | null | undefined) {
    if (!name) return "?";
    const parts = name.split(" ");
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  function formatStatus(status: string) {
    return status.charAt(0) + status.slice(1).toLowerCase().replace(/_/g, " ");
  }

  function truncate(str: string, n: number) {
    return str.length > n ? str.slice(0, n - 1) + "…" : str;
  }
  async function handleSave() {
    setSaving(true);
    try {
      const response = await axiosInstance.patch(
        api.updateJobApplication(app.id),
        {
          status,
          feedback,
          notes,
        }
      );
      if (response.status === 200) {
        toast.success("Application updated successfully!");
      } else {
        toast.error(response.data?.error || "Failed to update application.");
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.error || "Failed to update application."
      );
    } finally {
      setSaving(false);
      invalidateJobApplicationQueries(queryClient);
      router.push(pages.viewApplicants(job.id, job.title));
    }
  }

  return (
    <div className="flex flex-col md:flex-row gap-8 px-8 py-12 justify-center font-libertinus bg-[var(--r-gray)] max-h-[calc(100vh-7rem)] overflow-y-auto">
      {/* Left: Job Card & Actions */}
      <div className="w-full md:w-1/4 flex flex-col items-center gap-6">
        <Card
          className="w-full rounded-xl shadow-md cursor-pointer"
          onClick={() => router.push(pages.viewJob(job.id))}
        >
          <CardContent className="px-8 py-4 flex flex-col items-center">
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
        <RecruiterApplicationChatDialog
          resumeS3Url={resume.s3Url}
          jobDescription={job.description || ""}
          candidateName={`${jobSeeker.firstName} ${jobSeeker.lastName}`}
        />
      </div>

      {/* Right: Application Details & Recruiter Controls */}
      <div className="w-full md:w-2/3 flex flex-col gap-6">
        <Card className="rounded-xl shadow-md">
          <CardContent className="px-8 py-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
              <div>
                <div className="text-3xl font-dm-serif text-[var(--r-black)] mb-2">
                  Application Status
                </div>
                <div className="text-[var(--r-boldgray)] mb-2 text-lg">
                  Here are the details of this application
                </div>
              </div>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-56 bg-white !text-lg min-h-12">
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
              <div className="border-1 border-[var(--r-darkgray)] rounded-lg p-4 text-[var(--r-black)] min-h-[80px] whitespace-pre-line bg-gray-100">
                {app.coverLetter ? (
                  app.coverLetter
                ) : (
                  <span className="text-gray-400">
                    No cover letter submitted.
                  </span>
                )}
              </div>
            </div>
            {/* Feedback (Editable) */}
            <div className="mb-6">
              <div className="text-2xl font-dm-serif text-[var(--r-boldgray)] mb-4 mt-8">
                Feedback to Candidate
              </div>
              <textarea
                className="border-1 border-[var(--r-darkgray)] rounded-lg p-4 text-[var(--r-black)] min-h-[80px] w-full bg-white focus:outline-none focus:ring-2 focus:ring-[var(--r-blue)]"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Write feedback for the candidate..."
              />
            </div>
            {/* Notes (Editable) */}
            <div className="mb-6">
              <div className="text-2xl font-dm-serif text-[var(--r-boldgray)] mb-4 mt-8">
                Internal Notes
              </div>
              <textarea
                className="border-1 border-[var(--r-darkgray)] rounded-lg p-4 text-[var(--r-black)] min-h-[80px] w-full bg-white focus:outline-none focus:ring-2 focus:ring-[var(--r-blue)]"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add internal notes (visible only to recruiters)..."
              />
            </div>
            <Button
              className="w-full h-12 text-lg bg-[var(--r-blue)] text-white hover:bg-[var(--r-blue)]/80 mt-4"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>
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
