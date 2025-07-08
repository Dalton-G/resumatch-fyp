"use server";

import { signIn, signOut } from "@/lib/auth";
import { pages } from "@/config/directory";
import { LoginFormType } from "@/components/auth/login-form";

export async function signInWithGoogle() {
  await signIn("google", { redirect: true, redirectTo: pages.dashboard });
}

export async function signInWithCredentials(formData: LoginFormType) {
  return await signIn("credentials", {
    email: formData.email,
    password: formData.password,
    redirect: false,
  });
}

export async function signOutOfAllProviders() {
  await signOut({ redirect: true, redirectTo: pages.login });
}
