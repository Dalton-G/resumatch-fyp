import CompanyDashboardContent from "./company-dashboard-content";

interface CompanyDashboardProps {
  userId: string;
}

export default function CompanyDashboard({ userId }: CompanyDashboardProps) {
  return <CompanyDashboardContent userId={userId} />;
}
