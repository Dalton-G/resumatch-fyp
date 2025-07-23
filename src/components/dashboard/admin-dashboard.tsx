import Heading from "../custom/heading";
import AdminDashboardContent from "./admin-dashboard-content";

interface AdminDashboardProps {
  userId: string;
}

export default function AdminDashboard({ userId }: AdminDashboardProps) {
  return (
    <div>
      <Heading title="Admin Dashboard" />
      <AdminDashboardContent userId={userId} />
    </div>
  );
}
