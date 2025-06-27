"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { recruiterPersonalSchema } from "@/schema/auth-schema";
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
import { forwardRef, useImperativeHandle } from "react";

const RecruiterPersonalForm = forwardRef(function RecruiterPersonalForm(
  {
    initialValues,
    onContinue,
  }: {
    initialValues: any;
    onContinue: (data: any) => void;
  },
  ref
) {
  const form = useForm({
    resolver: zodResolver(recruiterPersonalSchema),
    defaultValues: initialValues,
    mode: "onSubmit",
  });

  async function validateAndContinue() {
    const valid = await form.trigger();
    if (valid) {
      onContinue(form.getValues());
      return true;
    }
    return false;
  }

  useImperativeHandle(ref, () => ({
    validateAndContinue,
  }));

  function handleContinue(data: any) {
    onContinue(data);
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleContinue)}
        className="w-full flex flex-col gap-4"
        autoComplete="off"
        noValidate
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
          className="mt-4 w-full bg-[var(--r-blue)] hover:bg-blue-600 text-white font-libertinus text-base font-semibold rounded-md py-2"
        >
          Continue
        </Button>
      </form>
    </Form>
  );
});

export default RecruiterPersonalForm;
