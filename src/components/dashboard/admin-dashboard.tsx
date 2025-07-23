interface AdminDashboardProps {
  userId: string;
}

export default function AdminDashboard({ userId }: AdminDashboardProps) {
  return <div>Admin Dashboard Placeholder for User ID: {userId}</div>;
}
