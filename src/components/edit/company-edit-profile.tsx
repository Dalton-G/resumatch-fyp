"use client";
import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ProfilePictureUploader from "@/components/upload/profile-picture-uploader";
import { useCurrentUserProfile } from "@/hooks/use-profile";
import { industryOptions, sizeOptions } from "@/config/company-options";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";
import { api } from "@/config/directory";
import { pages } from "@/config/directory";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { cacheKeys } from "@/config/cache-keys";

const companyProfileSchema = z.object({
  name: z.string().min(1, "Company name is required"),
  profilePicture: z.string().min(1, "Company logo is required"),
  website: z.string().min(1, "Company website is required"),
  industry: z.string().min(1, "Industry is required"),
  size: z.string().min(1, "Company size is required"),
  address: z.string().min(1, "Company address is required"),
  description: z.string().min(1, "Description is required"),
});

type CompanyProfileFormType = z.infer<typeof companyProfileSchema>;

export default function CompanyEditProfile({
  userId,
  role,
}: {
  userId: string;
  role: string;
}) {
  const {
    data: profile,
    isLoading,
    isError,
  } = useCurrentUserProfile(userId, role);
  const [logo, setLogo] = useState("");
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Prefill form with profile data
  const defaultValues: CompanyProfileFormType = {
    name: profile?.name || "",
    profilePicture: profile?.profilePicture || profile?.logoUrl || "",
    website: profile?.website || "",
    industry: profile?.industry || "",
    size: profile?.size || "",
    address: profile?.address || "",
    description: profile?.description || "",
  };

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CompanyProfileFormType>({
    resolver: zodResolver(companyProfileSchema),
    defaultValues,
  });

  // Keep logo state in sync with form
  useEffect(() => {
    if (profile?.profilePicture || profile?.logoUrl) {
      setLogo(profile.profilePicture || profile.logoUrl);
      setValue(
        "profilePicture",
        profile.profilePicture || profile.logoUrl || ""
      );
    }
  }, [profile, setValue]);

  const handleLogoUpload = (fileUrl: string) => {
    setValue("profilePicture", fileUrl, { shouldValidate: true });
    setLogo(fileUrl);
  };
  const handleLogoDelete = () => {
    setValue("profilePicture", "", { shouldValidate: true });
    setLogo("");
  };

  const onSubmit = async (data: CompanyProfileFormType) => {
    setIsSubmitting(true);
    try {
      const res = await axiosInstance.put(
        `${api.editProfile}?userId=${userId}&role=${role}`,
        data
      );
      if (res.status === 200) {
        toast.success("Profile updated successfully!");
        queryClient.invalidateQueries({ queryKey: [cacheKeys.profile] });
      } else {
        toast.error(res.data?.error || "Failed to update profile");
      }
    } catch (e: any) {
      toast.error(e.response?.data?.error || "Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="p-8">Loading profile...</div>;
  if (isError || !profile)
    return <div className="p-8 text-red-500">Failed to load profile.</div>;

  return (
    <div className="flex justify-center items-start min-h-screen bg-[var(--r-gray)] font-libertinus">
      <Card className="w-full max-w-5xl mt-12 mb-12 mx-4">
        <CardContent className="px-10 py-6">
          <h1 className="text-3xl font-bold font-dm-serif mb-6">
            Edit Profile
          </h1>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-8">
              <label className="block font-medium mb-2">Company Logo</label>
              <ProfilePictureUploader
                onUploadComplete={handleLogoUpload}
                onDelete={handleLogoDelete}
                initialFileUrl={logo}
              />
              {errors.profilePicture && (
                <span className="text-red-500 text-xs">
                  {errors.profilePicture.message}
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-6">
              <div>
                <label htmlFor="name" className="block font-medium mb-1">
                  Company Name
                </label>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <Input id="name" placeholder="Company Name" {...field} />
                  )}
                />
                {errors.name && (
                  <span className="text-red-500 text-xs">
                    {errors.name.message}
                  </span>
                )}
              </div>
              <div>
                <label htmlFor="website" className="block font-medium mb-1">
                  Company Website
                </label>
                <Controller
                  name="website"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="website"
                      placeholder="Company Website"
                      {...field}
                    />
                  )}
                />
                {errors.website && (
                  <span className="text-red-500 text-xs">
                    {errors.website.message}
                  </span>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-6">
              <div className="flex flex-row justify-between">
                <div>
                  <label htmlFor="industry" className="block font-medium mb-1">
                    Company Industry
                  </label>
                  <Controller
                    name="industry"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger id="industry">
                          <SelectValue placeholder="Select Industry" />
                        </SelectTrigger>
                        <SelectContent>
                          {industryOptions.map((option: string) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.industry && (
                    <span className="text-red-500 text-xs">
                      {errors.industry.message}
                    </span>
                  )}
                </div>
                <div>
                  <label htmlFor="size" className="block font-medium mb-1">
                    Company Size
                  </label>
                  <Controller
                    name="size"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger id="size">
                          <SelectValue placeholder="Select Size" />
                        </SelectTrigger>
                        <SelectContent>
                          {sizeOptions.map((option: string) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.size && (
                    <span className="text-red-500 text-xs">
                      {errors.size.message}
                    </span>
                  )}
                </div>
              </div>
              <div>
                <label htmlFor="address" className="block font-medium mb-1">
                  Company Address
                </label>
                <Controller
                  name="address"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="address"
                      placeholder="Company Address"
                      {...field}
                    />
                  )}
                />
                {errors.address && (
                  <span className="text-red-500 text-xs">
                    {errors.address.message}
                  </span>
                )}
              </div>
            </div>
            <div className="mb-8">
              <label htmlFor="description" className="block font-medium mb-1">
                Description
              </label>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <Textarea
                    id="description"
                    placeholder="Description"
                    rows={4}
                    {...field}
                  />
                )}
              />
              {errors.description && (
                <span className="text-red-500 text-xs">
                  {errors.description.message}
                </span>
              )}
            </div>
            <div className="flex justify-between">
              <Link href={`${pages.viewProfile}/${userId}`}>
                <Button
                  className="w-48 text-black bg-white border-1 font-dm-serif hover:border-[var(--r-blue)] hover:bg-white mr-4"
                  variant="default"
                >
                  View Profile
                </Button>
              </Link>
              <Button
                type="submit"
                className="bg-[var(--r-blue)] text-white hover:bg-[var(--r-blue)]/90 w-48 font-dm-serif"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
