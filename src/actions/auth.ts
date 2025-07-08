"use server";

import { signIn, signOut } from "@/lib/auth";
import { pages } from "@/config/directory";
import { LoginFormType } from "@/components/auth/login-form";
import { AuthError } from "next-auth";

export async function signInWithGoogle() {
  await signIn("google", { redirect: true, redirectTo: pages.dashboard });
}

export async function signInWithCredentials(formData: LoginFormType) {
  try {
    const result = await signIn("credentials", {
      email: formData.email,
      password: formData.password,
      redirect: false,
    });
    return result;
  } catch (error) {
    if (error instanceof AuthError && error.type === "CredentialsSignin") {
      return { error: "Invalid Email or Password" };
    }
    return { error: "An error occurred in auth.ts" };
  }
}

export async function signOutOfAllProviders() {
  await signOut({ redirect: true, redirectTo: pages.login });
}
