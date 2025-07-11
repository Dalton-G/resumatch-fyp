import { ensureAuth } from "@/lib/utils/check-role";
import JobSeekerEditProfile from "@/components/edit/job-seeker-edit-profile";
import CompanyEditProfile from "@/components/edit/company-edit-profile";
import AdminEditProfile from "@/components/edit/admin-edit-profile";

export default async function Page() {
  const session = await ensureAuth();
  const role = session.user.role;
  const userId = session.user.id;

  if (role === "JOB_SEEKER") {
    return <JobSeekerEditProfile userId={userId} role={role} />;
  }
  if (role === "COMPANY") {
    return <CompanyEditProfile userId={userId} role={role} />;
  }
  if (role === "ADMIN") {
    return <AdminEditProfile userId={userId} role={role} />;
  }
  // Placeholder for other roles
  return (
    <div className="p-8">
      Profile editing for this role is not yet implemented.
    </div>
  );
}
