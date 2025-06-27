"use server";

import { signIn, signOut } from "@/auth";

export async function signInWithGoogle() {
  await signIn("google", { redirect: true, redirectTo: "/dashboard" });
}

export async function signInWithCredentials(formData: FormData) {
  console.log(formData);
  await signIn("credentials", {
    email: formData.get("email"),
    password: formData.get("password"),
    redirect: true,
    redirectTo: "/dashboard",
  });
}

export async function signOutOfAllProviders() {
  await signOut({ redirect: true, redirectTo: "/" });
}
