import SignOutOfAllProvidersButton from "@/components/auth/sign-out-of-all-providers";
import { auth } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await auth();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1>Dashboard</h1>
      <SignOutOfAllProvidersButton />
    </div>
  );
}
