import Heading from "@/components/custom/heading";
import RecruiterJobApplicationContent from "@/components/job-applicants/recruiter-job-application-content";

interface ViewRecruiterApplicationPageProps {
  params: Promise<{ id: string }>;
}

export default async function ViewRecruiterApplicationPage({
  params,
}: ViewRecruiterApplicationPageProps) {
  const { id } = await params;
  return (
    <div>
      <Heading title={"View Application"} />
      <RecruiterJobApplicationContent applicationId={id} />
    </div>
  );
}
