import { auth } from "@/lib/auth";
import { JobViewClient } from "@/components/job-details/JobViewClient";

interface JobViewPageProps {
  params: Promise<{ jobId: string }>;
}

export default async function JobViewPage({ params }: JobViewPageProps) {
  const { jobId } = await params;
  const session = await auth();
  const userRole = session?.user?.role || null;
  const userId = session?.user?.id || null;
  return <JobViewClient jobId={jobId} userRole={userRole} userId={userId} />;
}
