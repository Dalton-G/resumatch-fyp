"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { companyRegistrationSchema } from "@/schema/auth-schema";
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
import axios from "@/lib/axios";
import { api, pages } from "@/config/directory";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { industryOptions, sizeOptions } from "@/config/company-options";
import { z } from "zod";
import { useState, useEffect } from "react";
import ProfilePictureUploader from "@/components/upload/profile-picture-uploader";

export default function CompanyForm() {
  const router = useRouter();
  const [logo, setLogo] = useState("");

  type CompanyRegistrationForm = z.infer<typeof companyRegistrationSchema>;
  const form = useForm<CompanyRegistrationForm>({
    resolver: zodResolver(companyRegistrationSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      companyName: "",
      companyDescription: "",
      companyWebsite: "",
      companyIndustry: "",
      companySize: "",
      companyAddress: "",
      companyLogo: "",
    },
    mode: "onSubmit",
  });

  const { setValue } = form;

  // Sync logo state with form field
  useEffect(() => {
    if (logo) {
      setValue("companyLogo", logo, { shouldValidate: true });
    }
  }, [logo, setValue]);

  // Logo upload handlers
  const handleLogoUpload = (fileUrl: string) => {
    setValue("companyLogo", fileUrl, { shouldValidate: true });
    setLogo(fileUrl);
  };

  const handleLogoDelete = () => {
    setValue("companyLogo", "", { shouldValidate: true });
    setLogo("");
  };

  async function handleSubmit(data: CompanyRegistrationForm) {
    try {
      const response = await axios.post(api.companyRegister, data);
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
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="w-full flex flex-col gap-4 font-libertinus"
        autoComplete="off"
        noValidate
      >
        {/* Email */}
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
        <div className="flex gap-4">
          {/* Password */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="w-full">
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
          {/* Confirm Password */}
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem className="w-full">
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
        </div>
        {/* Company Name */}
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
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Company Description */}
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
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Company Website */}
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
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex gap-4">
          {/* Company Industry */}
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
                      {industryOptions.map((option) => (
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
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Company Size */}
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
                      {sizeOptions.map((option) => (
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
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        {/* Company Address */}
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
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Company Logo */}
        <FormField
          control={form.control}
          name="companyLogo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company Logo</FormLabel>
              <FormControl>
                <ProfilePictureUploader
                  onUploadComplete={handleLogoUpload}
                  onDelete={handleLogoDelete}
                  initialFileUrl={logo}
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
          Create Account
        </Button>
      </form>
    </Form>
  );
}
