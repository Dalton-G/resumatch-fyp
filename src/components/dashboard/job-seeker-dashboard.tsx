import Heading from "../custom/heading";
import JobSeekerDashboardContent from "./job-seeker-dashboard-content";

interface JobSeekerDashboardProps {
  userId: string;
}

export default function JobSeekerDashboard({
  userId,
}: JobSeekerDashboardProps) {
  return (
    <div>
      <Heading title="Dashboard" />
      <JobSeekerDashboardContent userId={userId} />
    </div>
  );
}
