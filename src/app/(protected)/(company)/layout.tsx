import { ensureRole } from "@/lib/utils/check-role";
import { UserRole } from "@prisma/client";

export default async function CompanyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await ensureRole(UserRole.COMPANY);
  return <>{children}</>;
}
