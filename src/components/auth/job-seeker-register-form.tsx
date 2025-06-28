"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { jobSeekerSignUpSchema } from "@/schema/auth-schema";
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

type JobSeekerSignUpForm = z.infer<typeof jobSeekerSignUpSchema>;

export default function JobSeekerRegisterForm() {
  const form = useForm<JobSeekerSignUpForm>({
    resolver: zodResolver(jobSeekerSignUpSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  function onSubmit(data: JobSeekerSignUpForm) {
    console.log(data);
  }

  return (
    <div className="w-full font-libertinus">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full max-w-md mx-auto flex flex-col gap-4"
          autoComplete="off"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="font-libertinus bg-white"
                      placeholder=""
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="font-libertinus bg-white"
                      placeholder=""
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    {...field}
                    className="font-libertinus bg-white"
                    placeholder=""
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
                    {...field}
                    className="font-libertinus bg-white"
                    placeholder=""
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    {...field}
                    className="font-libertinus bg-white"
                    placeholder=""
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="mt-4 bg-[var(--r-blue)] hover:bg-blue-600 text-white font-libertinus text-base font-semibold rounded-md py-2"
          >
            Create Account
          </Button>
        </form>
        <div className="flex items-center my-6 w-full">
          <div className="flex-grow border-t border-gray-300" />
          <span className="mx-4 text-sm text-muted-foreground font-libertinus">
            or you may:
          </span>
          <div className="flex-grow border-t border-gray-300" />
        </div>
        <GoogleButton className="w-full mb-4" />
        <p className="text-center text-sm font-libertinus mt-2">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="text-[var(--r-blue)] underline-offset-2 hover:underline"
          >
            Login
          </Link>
        </p>
      </Form>
    </div>
  );
}
