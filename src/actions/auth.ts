"use server";

import { signIn, signOut } from "@/lib/auth";
import { pages } from "@/config/directory";

export async function signInWithGoogle() {
  await signIn("google", { redirect: true, redirectTo: pages.jobPortal });
}

export async function signOutOfAllProviders() {
  await signOut({ redirect: true, redirectTo: pages.login });
}
