"use server";

import { signIn, signOut } from "@/../auth";
import { redirect } from "next/dist/server/api-utils";

export async function signInWithGitHub() {
  await signIn("github", { redirect: true, redirectTo: "/dashboard" });
}

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
