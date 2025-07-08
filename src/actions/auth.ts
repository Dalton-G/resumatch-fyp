"use server";

import { signIn, signOut } from "@/lib/auth";
import { routes } from "@/config/directory";

export async function signInWithGoogle() {
  await signIn("google", { redirect: true, redirectTo: routes.dashboard });
}

export async function signInWithCredentials(formData: FormData) {
  console.log(formData);
  await signIn("credentials", {
    email: formData.get("email"),
    password: formData.get("password"),
    redirect: true,
    redirectTo: routes.dashboard,
  });
}

export async function signOutOfAllProviders() {
  await signOut({ redirect: true, redirectTo: routes.login });
}
