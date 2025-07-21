import { ensureAuth } from "@/lib/utils/check-role";
import JobMatcherContent from "@/components/jobs/job-matcher-content";

export default async function JobMatcherPage() {
  const session = await ensureAuth();

  return (
    <div className="flex flex-col min-h-screen bg-[var(--r-gray)]">
      <div className="flex bg-white p-8 border-b-1 border-[var(--r-darkgray)] font-dm-serif">
        <h1 className="text-3xl">AI Job Matching</h1>
      </div>
      <JobMatcherContent userId={session.user.id} />
    </div>
  );
}
