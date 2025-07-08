import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { compare } from "bcrypt";
import { ZodError } from "zod";
import { signInSchema } from "../schema/auth-schema";
import { prisma } from "./prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
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
          const { email, password } = await signInSchema.parseAsync(
            credentials
          );

          const user = await prisma.user.findUnique({
            where: {
              email: email,
            },
          });
          if (!user || !user.password) return null;

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
