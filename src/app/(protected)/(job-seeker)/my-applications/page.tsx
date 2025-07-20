import Heading from "@/components/custom/heading";
import MyJobApplicationsList from "@/components/job-applications/my-job-applications-list";

export default function myApplicationsPage() {
  return (
    <div>
      <Heading title="My Job Applications" />
      <MyJobApplicationsList />
    </div>
  );
}
