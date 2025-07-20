import Heading from "@/components/custom/heading";
import ApplyForJobForm from "@/components/jobs/apply-for-job-form";
import { ensureAuth } from "@/lib/utils/check-role";

export default async function ApplyForJobPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = await params;

  return (
    <div>
      <Heading title="Apply for Position" />
      <ApplyForJobForm jobId={jobId} />
    </div>
  );
}
