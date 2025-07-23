import Heading from "../custom/heading";
import CompanyDashboardContent from "./company-dashboard-content";

interface CompanyDashboardProps {
  userId: string;
}

export default function CompanyDashboard({ userId }: CompanyDashboardProps) {
  return (
    <div>
      <Heading title="Dashboard" />
      <CompanyDashboardContent userId={userId} />
    </div>
  );
}
