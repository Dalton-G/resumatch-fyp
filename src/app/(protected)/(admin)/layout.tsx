import { ensureRole } from "@/lib/utils/check-role";
import { UserRole } from "@prisma/client";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await ensureRole(UserRole.ADMIN);
  return <>{children}</>;
}
