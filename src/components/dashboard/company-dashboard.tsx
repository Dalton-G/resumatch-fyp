interface CompanyDashboardProps {
  userId: string;
}

export default function CompanyDashboard({ userId }: CompanyDashboardProps) {
  return <div>Company Dashboard Placeholder for User ID: {userId}</div>;
}
