import Heading from "../custom/heading";

interface JobSeekerDashboardProps {
  userId: string;
}

export default function JobSeekerDashboard({
  userId,
}: JobSeekerDashboardProps) {
  return (
    <div>
      <Heading title="Dashboard" />
      {/* Content Goes Here (in a importable component) */}
    </div>
  );
}
