import { useCompanyJobListings } from "@/hooks/use-company-job-listings";
import { pages } from "@/config/directory";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FiMapPin } from "react-icons/fi";
import { IoCashOutline } from "react-icons/io5";
import { JobStatus } from "@prisma/client";
import { FaRegEye } from "react-icons/fa";

interface Job {
  id: string;
  title: string;
  description: string;
  salaryMin: number;
  salaryMax: number;
  status: string;
  country: string;
  workType: string;
  views: number;
}

export function CompanyJobList({ userId }: { userId: string }) {
  const { data: jobs, isLoading, isError } = useCompanyJobListings(userId);

  if (isLoading) return <div className="text-center">Loading jobs...</div>;
  if (isError)
    return <div className="text-center text-red-500">Failed to load jobs.</div>;

  if (!jobs || jobs.length === 0) {
    return (
      <div className="text-center text-gray-500">
        No active job postings by this company.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
      {jobs.map((job: Job) => (
        <Card
          key={job.id}
          className="p-0 cursor-pointer border-2 transition hover:border-[var(--r-blue)] hover:border-2 shadow-none hover:shadow-none"
          onClick={() => (window.location.href = pages.viewJob(job.id))}
        >
          <CardContent className="p-8 flex flex-col gap-4 font-libertinus">
            <div className="flex flex-wrap gap-2">
              <span className="text-xl font-dm-serif text-[var(--r-black)]">
                {truncate(job.title, 70)}
              </span>
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
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {job.workType.charAt(0) + job.workType.slice(1).toLowerCase()}
              </Badge>
            </div>
            <div className="text-[var(--r-boldgray)] text-lg truncate max-w-full">
              {truncate(job.description, 120)}
            </div>
            <div className="flex flex-wrap gap-6 items-center text-black text-lg">
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
                <FaRegEye className="mr-1" />
                {job.views}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function truncate(str: string, n: number) {
  return str.length > n ? str.slice(0, n - 1) + "…" : str;
}
