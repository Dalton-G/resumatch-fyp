"use server";

import { signIn, signOut } from "@/../auth";

export async function signInWithGitHub() {
  await signIn("github");
}

export async function signInWithGoogle() {
  await signIn("google");
}

export async function signInWithCredentials(email: string, password: string) {
  await signIn("credentials", {
    email,
    password,
    redirect: true,
    redirectTo: "/dashboard",
  });
}

export async function signOutOfAllProviders() {
  await signOut();
}
