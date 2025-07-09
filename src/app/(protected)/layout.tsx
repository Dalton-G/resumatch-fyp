import { SidebarProvider } from "@/components/ui/sidebar";
import { pages } from "@/config/directory";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session || !session.user) redirect(pages.login);

  return (
    <>
      <SidebarProvider>
        {session && (
          <>
            <h1>Sidebar itself</h1>
            <main className="flex-1">{children}</main>
          </>
        )}
      </SidebarProvider>
    </>
  );
}
