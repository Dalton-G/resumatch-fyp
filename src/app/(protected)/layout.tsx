import { pages } from "@/config/directory";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import ProtectedSidebar from "@/components/layout/protected-sidebar";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session || !session.user) redirect(pages.login);

  const { name, image, role } = session.user;

  return (
    <div className="flex min-h-screen bg-[var(--r-gray)]">
      <ProtectedSidebar name={name} image={image} role={role} />
      <main className="flex-1 min-h-screen">{children}</main>
    </div>
  );
}
