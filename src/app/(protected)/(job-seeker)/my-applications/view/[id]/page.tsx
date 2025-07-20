import Heading from "@/components/custom/heading";
import MyJobApplicationContent from "@/components/job-applications/my-job-application-content";

interface ViewMyApplicationPageProps {
  params: Promise<{ id: string }>;
}

export default async function ViewMyApplicationPage({
  params,
}: ViewMyApplicationPageProps) {
  const { id } = await params;
  return (
    <div>
      <Heading title={"View Application"} />
      <MyJobApplicationContent applicationId={id} />
    </div>
  );
}
