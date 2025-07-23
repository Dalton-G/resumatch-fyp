import { ensureAuth } from "@/lib/utils/check-role";
import JobSeekerEditProfile from "@/components/edit/job-seeker-edit-profile";
import CompanyEditProfile from "@/components/edit/company-edit-profile";
import AdminEditProfile from "@/components/edit/admin-edit-profile";
import Heading from "@/components/custom/heading";
import { UserRole } from "@prisma/client";

export default async function Page() {
  const session = await ensureAuth();
  const role = session.user.role;
  const userId = session.user.id;

  if (role === UserRole.JOB_SEEKER) {
    return (
      <div>
        <Heading title="Edit Profile" />
        <JobSeekerEditProfile userId={userId} role={role} />
      </div>
    );
  }
  if (role === UserRole.COMPANY) {
    return (
      <div>
        <Heading title="Edit Profile" />
        <CompanyEditProfile userId={userId} role={role} />
      </div>
    );
  }
  if (role === UserRole.ADMIN) {
    return (
      <div>
        <Heading title="Edit Profile" />
        <AdminEditProfile userId={userId} role={role} />
      </div>
    );
  }
  // Placeholder for other roles
  return (
    <div className="p-8">
      Profile editing for this role is not yet implemented.
    </div>
  );
}
