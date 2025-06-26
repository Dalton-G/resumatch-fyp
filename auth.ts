import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma/client";
import { compare } from "bcrypt-ts";
import { signInSchema } from "./lib/schema/auth-schema";
import { ZodError } from "zod";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google,
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "Email" },
        password: {
          label: "Password",
          type: "password",
          placeholder: "Password",
        },
      },
      authorize: async (credentials) => {
        try {
          if (!credentials.email || !credentials.password) return null;

          const { email, password } = await signInSchema.parseAsync(
            credentials
          );

          const user = await prisma.user.findUnique({
            where: {
              email: email,
            },
          });
          if (!user) return null;

          const passwordMatched = await compare(
            password,
            user.password as string
          );
          if (passwordMatched) return user;
          return null;
        } catch (error) {
          if (error instanceof ZodError) {
            console.log({
              message: "Error in credentials provider (auth.ts): ZodError",
              error: error,
            });
            return null;
          }
          console.log({
            message: "Error in credentials provider (auth.ts): OtherError",
            error: error,
          });
          return null;
        }
      },
    }),
  ],
});
