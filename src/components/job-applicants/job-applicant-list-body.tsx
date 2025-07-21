import { useState, useMemo } from "react";
import { JobApplicantsResponse } from "@/lib/types/job-applicants-view-response";
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
import { HiOutlineDocumentText } from "react-icons/hi2";
import { MdOutlineAccessTime, MdFilterAltOff } from "react-icons/md";
import { toast } from "sonner";
import { cleanFilename } from "@/lib/utils/clean-filename";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ApplicationStatus } from "@prisma/client";

// Status options (formatted)
const statusOptions = [
  { value: ApplicationStatus.APPLIED, label: "Applied" },
  { value: ApplicationStatus.REVIEWING, label: "Reviewing" },
  { value: ApplicationStatus.SHORTLISTED, label: "Shortlisted" },
  { value: ApplicationStatus.REJECTED, label: "Rejected" },
  { value: ApplicationStatus.SUCCESS, label: "Success" },
];

function getInitials(firstName?: string | null, lastName?: string | null) {
  if (!firstName && !lastName) return "?";
  if (firstName && !lastName) return firstName[0].toUpperCase();
  if (!firstName && lastName) return lastName[0].toUpperCase();
  return `${firstName![0].toUpperCase()}${lastName![0].toUpperCase()}`;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
}

function truncate(str: string, n: number) {
  if (!str) return "";
  return str.length > n ? str.slice(0, n - 1) + "…" : str;
}

interface JobApplicantListBodyProps {
  jobApplicants: JobApplicantsResponse;
}

export default function JobApplicantListBody({
  jobApplicants,
}: JobApplicantListBodyProps) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const filtered = useMemo(() => {
    let apps = [...jobApplicants.applications];
    if (search) {
      const s = search.toLowerCase();
      apps = apps.filter((a) => {
        const name = `${a.jobSeeker.firstName || ""} ${
          a.jobSeeker.lastName || ""
        }`.toLowerCase();
        const profession = (a.jobSeeker.profession || "").toLowerCase();
        return name.includes(s) || profession.includes(s);
      });
    }
    if (status) {
      apps = apps.filter((a) => a.status === status);
    }
    return apps;
  }, [jobApplicants.applications, search, status]);

  return (
    <div className="px-8 py-6 font-libertinus">
      {/* Search and Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 items-center">
        <Input
          className="w-full bg-white !text-lg h-12"
          placeholder="Search Applicant Name or Profession"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-full md:w-1/6 bg-white !text-lg min-h-12">
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

      {/* Applicant Cards */}
      <div className="flex flex-col gap-6 overflow-y-auto max-h-[calc(100vh-14.3rem)]">
        {filtered.length === 0 ? (
          <div className="text-center text-gray-500 py-12 text-lg">
            No applicants found.
          </div>
        ) : (
          filtered.map((app) => (
            <Card
              key={app.id}
              className="p-0 cursor-pointer border-2 transition hover:border-[var(--r-blue)] hover:border-2 shadow-none hover:shadow-none"
              onClick={(e) => {
                // Prevent card click when clicking on action buttons
                if ((e.target as HTMLElement).closest("button")) return;
                // You can add navigation here if needed
              }}
            >
              <CardContent className="p-8 flex md:flex-row md:items-center gap-4 relative">
                {/* Profile Picture or Initials */}
                <div className="flex flex-col h-[160px] items-center justify-start mr-4 -mt-4">
                  <div className="w-20 h-20 rounded-full bg-[var(--r-darkgray)] text-3xl font-dm-serif overflow-hidden">
                    {app.jobSeeker.profilePicture ? (
                      <img
                        src={app.jobSeeker.profilePicture}
                        alt="Profile"
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <span>
                        {getInitials(
                          app.jobSeeker.firstName,
                          app.jobSeeker.lastName
                        )}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col w-full">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap gap-2 mb-2 items-center">
                      <span className="text-2xl font-dm-serif text-[var(--r-black)] mr-2">
                        {app.jobSeeker.firstName} {app.jobSeeker.lastName}
                      </span>
                      {/* Status Badge with custom color */}
                      <Badge
                        variant="secondary"
                        className={cn(
                          app.status === "APPLIED"
                            ? "bg-blue-100 text-blue-800"
                            : app.status === "REVIEWING"
                            ? "bg-yellow-100 text-yellow-800"
                            : app.status === "SHORTLISTED"
                            ? "bg-purple-100 text-purple-800"
                            : app.status === "REJECTED"
                            ? "bg-red-100 text-red-800"
                            : app.status === "SUCCESS"
                            ? "bg-green-100 text-green-800"
                            : "",
                          "p-2"
                        )}
                      >
                        {statusOptions.find((opt) => opt.value === app.status)
                          ?.label || app.status}
                      </Badge>
                    </div>
                    <div className="text-[var(--r-boldgray)] mb-4 text-lg truncate max-w-full">
                      {app.jobSeeker.profession || "-"}
                    </div>
                    <div className="text-black mb-4 text-lg truncate max-w-full">
                      {truncate(app.coverLetter || "", 120)}
                    </div>
                    <div className="flex flex-wrap gap-12 items-center text-[var(--r-boldgray)] text-lg mb-4">
                      <span className="flex items-center gap-1">
                        <MdOutlineAccessTime className="mr-1" /> Applied:{" "}
                        {formatDate(app.appliedAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <HiOutlineDocumentText className="mr-1" />
                        <span className="truncate max-w-[300px]">
                          {cleanFilename(app.resume.fileName)}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col min-h-[160px] items-center justify-end">
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      toast.success(`clicked view applicant on id: ${app.id}`);
                    }}
                    className="bg-[var(--r-blue)] text-white w-40 text-md hover:bg-[var(--r-blue)]/80"
                  >
                    View Application
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
