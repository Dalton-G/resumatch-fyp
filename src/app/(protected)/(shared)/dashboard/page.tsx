import AdminDashboard from "@/components/dashboard/admin-dashboard";
import CompanyDashboard from "@/components/dashboard/company-dashboard";
import JobSeekerDashboard from "@/components/dashboard/job-seeker-dashboard";
import { ensureAuth } from "@/lib/utils/check-role";
import { UserRole } from "@prisma/client";
import { Session } from "next-auth";

export default async function DashboardPage() {
  const session: Session = await ensureAuth();

  switch (session.user.role) {
    case UserRole.JOB_SEEKER:
      return <JobSeekerDashboard userId={session.user.id} />;
    case UserRole.COMPANY:
      return <CompanyDashboard userId={session.user.id} />;
    case UserRole.ADMIN:
      return <AdminDashboard userId={session.user.id} />;
    default:
      return <div className="text-2xl">Unauthorized</div>;
  }
}
