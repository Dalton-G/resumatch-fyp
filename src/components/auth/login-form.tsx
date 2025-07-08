"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signInSchema } from "@/schema/auth-schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import GoogleButton from "./google-button";
import Link from "next/link";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { pages } from "@/config/directory";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export type LoginFormType = z.infer<typeof signInSchema>;

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const form = useForm<LoginFormType>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: LoginFormType) {
    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
      callbackUrl: pages.dashboard,
    });

    if (result?.error) {
      toast.error("Login failed");
      form.setError("email", { message: "Invalid Email or Password" });
      form.setError("password", { message: "Invalid Email or Password" });
      return;
    }

    if (result?.ok && result.url) {
      toast.success("Login successful");
      router.push(result.url);
    }
  }

  return (
    <div
      className={cn(
        "w-full max-w-sm mx-auto flex flex-col justify-center font-libertinus",
        className
      )}
      {...props}
    >
      <h1 className="text-3xl font-bold font-dm-serif mb-2 text-center md:text-center mt-4">
        Welcome back
      </h1>
      <p className="mb-8 text-center md:text-center font-libertinus">
        Please login to your{" "}
        <a
          href="#"
          className="text-[var(--r-blue)] underline-offset-2 hover:underline font-medium"
        >
          ResuMatch
        </a>{" "}
        account
      </p>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="example@mail.com"
                    className="mt-1 font-libertinus bg-white"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="********"
                    className="mt-1 font-libertinus bg-white"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="mt-2 bg-[var(--r-blue)] hover:bg-blue-600 text-white font-libertinus text-base font-semibold rounded-md py-2"
          >
            Login
          </Button>
        </form>
      </Form>
      <div className="flex items-center my-6">
        <div className="flex-grow border-t border-gray-300" />
        <span className="mx-4 text-sm text-muted-foreground font-libertinus">
          or you may:
        </span>
        <div className="flex-grow border-t border-gray-300" />
      </div>
      <GoogleButton className="mb-4 w-full" />
      <p className="text-center text-sm font-libertinus mt-2 mb-4">
        Don&apos;t have an account?{" "}
        <Link
          href={pages.register}
          className="text-[var(--r-blue)] underline-offset-2 hover:underline"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}
