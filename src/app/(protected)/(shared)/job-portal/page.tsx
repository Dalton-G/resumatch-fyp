import JobPortalHeading from "@/components/jobs/job-portal-heading";
import JobPortalList from "@/components/jobs/job-portal-list";
import { ensureAuth } from "@/lib/utils/check-role";

export default async function JobPortalPage() {
  const session = await ensureAuth();
  return (
    <div className="flex flex-col min-h-screen bg-[var(--r-gray)]">
      <JobPortalHeading userRole={session.user.role} />
      <JobPortalList userRole={session.user.role} />
    </div>
  );
}
