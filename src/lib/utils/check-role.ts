import { redirect } from "next/navigation";
import { auth } from "../auth";
import { pages } from "@/config/directory";

export async function ensureRole(expectedRole: string) {
  const session = await auth();
  if (!session || !session.user) redirect(pages.login);
  if (session.user.role !== expectedRole) redirect(pages.jobPortal);
  return session;
}

export async function ensureAuth() {
  const session = await auth();
  if (!session || !session.user) redirect(pages.login);
  return session;
}

export async function redirectToHomePage() {
  const session = await ensureAuth();
  switch (session.user.role) {
    case "JOB_SEEKER":
      redirect(pages.jobPortal);
    case "COMPANY":
      redirect(pages.myJobPostings);
    case "ADMIN":
      redirect(pages.jobPortal);
    default:
      redirect(pages.login);
  }
}
