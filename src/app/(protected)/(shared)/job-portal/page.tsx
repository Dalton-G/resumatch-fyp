import ProfileDisplay from "@/components/profile/profile-display";
import { ensureAuth } from "@/lib/utils/check-role";

export default async function DashboardPage() {
  const session = await ensureAuth();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <ProfileDisplay userId={session.user.id} role={session.user.role} />
    </div>
  );
}
