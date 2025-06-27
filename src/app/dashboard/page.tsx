import SignOutOfAllProvidersButton from "@/components/auth/sign-out-of-all-providers";
import { auth } from "../../auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();
  if (!session || !session.user) redirect("/");

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1>Dashboard</h1>
      <p>Welcome, {session.user.name}</p>
      <p>Email: {session.user.email}</p>
      <p>Image: {session.user.image}</p>
      <p>ID: {session.user.id}</p>
      <SignOutOfAllProvidersButton />
    </div>
  );
}
