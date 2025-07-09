import { ensureRole } from "@/lib/utils/check-role";
import { UserRole } from "@prisma/client";

export default async function JobSeekerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await ensureRole(UserRole.JOB_SEEKER);
  return <>{children}</>;
}
