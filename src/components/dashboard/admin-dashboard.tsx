import AdminDashboardContent from "./admin-dashboard-content";

interface AdminDashboardProps {
  userId: string;
}

export default function AdminDashboard({ userId }: AdminDashboardProps) {
  return <AdminDashboardContent userId={userId} />;
}
