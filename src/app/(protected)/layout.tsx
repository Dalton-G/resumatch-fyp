import { pages } from "@/config/directory";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import ProtectedSidebar from "@/components/layout/protected-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session || !session.user) redirect(pages.login);

  const { id, name, image, role } = session.user;

  return (
    <SidebarProvider defaultOpen={true}>
      <ProtectedSidebar id={id} name={name} image={image} role={role} />
      <main className="flex-1 min-h-screen bg-[var(--r-gray)]">{children}</main>
    </SidebarProvider>
  );
}
