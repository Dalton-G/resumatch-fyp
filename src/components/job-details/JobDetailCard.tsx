import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FiMapPin } from "react-icons/fi";
import { IoCashOutline } from "react-icons/io5";
import { FaRegEye } from "react-icons/fa";
import { GrGroup } from "react-icons/gr";
import Image from "next/image";
import React from "react";
import { cn } from "@/lib/utils";
import { Separator } from "../ui/separator";

interface JobDetailCardProps {
  job: {
    title: string;
    description: string;
    location: string;
    salaryMin?: number | null;
    salaryMax?: number | null;
    status: string;
    workType: string;
    views: number;
    createdAt: string | Date;
    applicantCount: number;
  };
  company: {
    name: string;
    profilePicture?: string | null;
  };
}

const statusColors: Record<string, string> = {
  URGENTLY_HIRING: "bg-red-100 text-red-800",
  HIRING: "bg-green-100 text-green-800",
  CLOSED: "bg-slate-200 text-slate-600",
  CLOSED_BY_ADMIN: "bg-zinc-300 text-zinc-700",
};

const workTypeColors: Record<string, string> = {
  ONSITE: "bg-yellow-100 text-yellow-800",
  REMOTE: "bg-blue-100 text-blue-800",
  HYBRID: "bg-purple-100 text-purple-800",
};

function getDaysAgo(date: string | Date) {
  const now = new Date();
  const created = new Date(date);
  const diff = Math.floor(
    (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
  );
  return diff;
}

export function JobDetailCard({ job, company }: JobDetailCardProps) {
  return (
    <Card className="p-0">
      <CardContent className="py-8 px-12 flex flex-col gap-4">
        <div className="flex items-center gap-4 ">
          {company.profilePicture ? (
            <Image
              src={company.profilePicture}
              alt={company.name}
              width={480}
              height={480}
              className="rounded-full object-cover w-20 h-20"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-2xl">
              {company.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap justify-between gap-2 items-center">
              <span className="text-3xl font-dm-serif text-[var(--r-black)] truncate max-w-[80ch]">
                {job.title}
              </span>
              <div className="flex gap-4">
                <Badge
                  variant="secondary"
                  className={cn(statusColors[job.status] || "", "text-md")}
                >
                  {job.status
                    .replace(/_/g, " ")
                    .toLowerCase()
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                </Badge>
                <Badge
                  variant="secondary"
                  className={cn(workTypeColors[job.workType] || "", "text-md")}
                >
                  {job.workType.charAt(0) + job.workType.slice(1).toLowerCase()}
                </Badge>
              </div>
            </div>
            <div className="text-xl text-[var(--r-boldgray)] truncate max-w-[40ch] mt-1">
              {company.name}
            </div>
          </div>
        </div>
        <div className="flex gap-24 items-center text-black text-lg mb-4">
          <span className="flex items-center gap-1 ml-24">
            <FiMapPin className="mr-1" /> {job.location}
          </span>
          <span className="flex items-center gap-1">
            <IoCashOutline className="mr-1" />
            {job.salaryMin && job.salaryMax
              ? `RM${job.salaryMin.toLocaleString()} - RM${job.salaryMax.toLocaleString()}`
              : "-"}
          </span>
        </div>
        <div className="flex bg-[var(--r-gray)] p-8 rounded-md mb-4 items-center justify-center gap-64">
          <div className="flex flex-col justify-center items-center">
            <div className="font-dm-serif text-4xl">{job.applicantCount}</div>
            <div className="text-lg">Applicants</div>
          </div>
          <div className="flex flex-col justify-center items-center">
            <div className="font-dm-serif text-4xl">{job.views}</div>
            <div className="text-lg">Views</div>
          </div>
          <div className="flex flex-col justify-center items-center">
            <div className="font-dm-serif text-4xl">
              {getDaysAgo(job.createdAt)}
            </div>
            <div className="text-lg">Days Ago</div>
          </div>
        </div>
        <Separator className="my-2" />
        <div>
          <div className="font-dm-serif text-2xl mb-8">Job Description</div>
          <div className="whitespace-pre-line text-[var(--r-black)] !text-lg leading-relaxed text-justify">
            {job.description}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
