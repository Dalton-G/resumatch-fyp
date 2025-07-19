import { useCompanyJobListings } from "@/hooks/use-company-job-listings";
import { pages } from "@/config/directory";

interface Job {
  id: string;
  title: string;
  country: string;
  workType: string;
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {jobs.map((job: Job) => (
        <div
          key={job.id}
          className="p-4 border rounded-lg shadow hover:shadow-lg cursor-pointer bg-[var(--color-card)]"
          onClick={() => (window.location.href = pages.viewJob(job.id))}
        >
          <h3 className="text-lg font-bold text-[var(--color-primary)]">
            {job.title}
          </h3>
          <p className="text-sm text-muted-foreground">{job.country}</p>
          <p className="text-sm text-muted-foreground">{job.workType}</p>
        </div>
      ))}
    </div>
  );
}
