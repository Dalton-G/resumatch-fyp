"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { adminRegistrationSchema } from "@/schema/auth-schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { api, pages } from "@/config/directory";
import axios from "@/lib/axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type AdminSignUpForm = z.infer<typeof adminRegistrationSchema>;

export default function AdminRegisterForm() {
  const router = useRouter();
  const form = useForm<AdminSignUpForm>({
    resolver: zodResolver(adminRegistrationSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(data: AdminSignUpForm) {
    try {
      const response = await axios.post(api.adminRegister, data);
      if (response.status === 201) {
        toast.success("Registration successful! Please login to continue.");
        router.push(pages.login);
      }
      if (response.status === 400) {
        toast.error(response.data.error);
        form.setError("email", {
          message: response.data.error,
        });
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.error || "An error occurred during registration."
      );
    }
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
      </Form>
    </div>
  );
}
