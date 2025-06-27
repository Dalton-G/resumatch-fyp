"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { recruiterCompanySchema } from "@/schema/auth-schema";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

const INDUSTRY_OPTIONS = [
  "Technology",
  "Healthcare",
  "Finance",
  "Education",
  "Retail",
  "Manufacturing",
  "Construction",
  "Others",
];
const SIZE_OPTIONS = [
  "1-10 employees",
  "11-50 employees",
  "51-200 employees",
  "201-500 employees",
  "501-1000 employees",
  "1000+ employees",
];

export default function RecruiterCompanyForm({
  initialValues,
  onSubmit,
}: {
  initialValues: any;
  onSubmit: (data: any) => void;
}) {
  const [showErrors, setShowErrors] = useState(false);
  const form = useForm({
    resolver: zodResolver(recruiterCompanySchema),
    defaultValues: initialValues,
    mode: "onSubmit",
  });

  function handleSubmit(data: any) {
    setShowErrors(true);
    onSubmit(data);
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="w-full flex flex-col gap-4"
        autoComplete="off"
        noValidate
      >
        <FormField
          control={form.control}
          name="companyName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company Name</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  className="font-libertinus bg-white"
                  placeholder=""
                />
              </FormControl>
              {showErrors && <FormMessage />}
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="companyDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company Description</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  className="font-libertinus bg-white"
                  placeholder=""
                  rows={3}
                />
              </FormControl>
              {showErrors && <FormMessage />}
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="companyWebsite"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company Website URL</FormLabel>
              <FormControl>
                <Input
                  type="url"
                  {...field}
                  className="font-libertinus bg-white"
                  placeholder=""
                />
              </FormControl>
              {showErrors && <FormMessage />}
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="companyIndustry"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Company Industry</FormLabel>
              <FormControl>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  defaultValue={field.value}
                >
                  <SelectTrigger className="font-libertinus bg-white w-full">
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDUSTRY_OPTIONS.map((option) => (
                      <SelectItem
                        key={option}
                        value={option}
                        className="w-full"
                      >
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              {showErrors && <FormMessage />}
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="companySize"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Company Size</FormLabel>
              <FormControl>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  defaultValue={field.value}
                >
                  <SelectTrigger className="font-libertinus bg-white w-full">
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    {SIZE_OPTIONS.map((option) => (
                      <SelectItem
                        key={option}
                        value={option}
                        className="w-full"
                      >
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              {showErrors && <FormMessage />}
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="companyAddress"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company Address</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  className="font-libertinus bg-white"
                  placeholder=""
                />
              </FormControl>
              {showErrors && <FormMessage />}
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="companyLogo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company Logo URL</FormLabel>
              <FormControl>
                <Input
                  type="url"
                  {...field}
                  className="font-libertinus bg-white"
                  placeholder=""
                />
              </FormControl>
              {showErrors && <FormMessage />}
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="mt-4 w-full bg-[var(--r-blue)] hover:bg-blue-600 text-white font-libertinus text-base font-semibold rounded-md py-2"
        >
          Create Account
        </Button>
      </form>
    </Form>
  );
}
