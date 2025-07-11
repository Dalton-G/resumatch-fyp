"use client";
import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ProfilePictureUploader from "@/components/upload/profile-picture-uploader";
import { useCurrentUserProfile } from "@/hooks/use-profile";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";
import { api } from "@/config/directory";
import { useQueryClient } from "@tanstack/react-query";
import { cacheKeys } from "@/config/cache-keys";

const adminProfileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  profilePicture: z.string().min(1, "Profile picture is required"),
});

type AdminProfileFormType = z.infer<typeof adminProfileSchema>;

export default function AdminEditProfile({
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
  const [profilePicture, setProfilePicture] = useState("");
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultValues: AdminProfileFormType = {
    firstName: profile?.firstName || "",
    lastName: profile?.lastName || "",
    profilePicture: profile?.profilePicture || "",
  };

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<AdminProfileFormType>({
    resolver: zodResolver(adminProfileSchema),
    defaultValues,
  });

  useEffect(() => {
    if (profile?.profilePicture) {
      setProfilePicture(profile.profilePicture);
      setValue("profilePicture", profile.profilePicture);
    }
  }, [profile, setValue]);

  const handleProfilePictureUpload = (fileUrl: string) => {
    setValue("profilePicture", fileUrl, { shouldValidate: true });
    setProfilePicture(fileUrl);
  };
  const handleProfilePictureDelete = () => {
    setValue("profilePicture", "", { shouldValidate: true });
    setProfilePicture("");
  };

  const onSubmit = async (data: AdminProfileFormType) => {
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
              <label className="block font-medium mb-2">Profile Picture</label>
              <ProfilePictureUploader
                onUploadComplete={handleProfilePictureUpload}
                onDelete={handleProfilePictureDelete}
                initialFileUrl={profilePicture}
              />
              {errors.profilePicture && (
                <span className="text-red-500 text-xs">
                  {errors.profilePicture.message}
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-6">
              <div>
                <label htmlFor="firstName" className="block font-medium mb-1">
                  First Name
                </label>
                <Controller
                  name="firstName"
                  control={control}
                  render={({ field }) => (
                    <Input id="firstName" placeholder="First Name" {...field} />
                  )}
                />
                {errors.firstName && (
                  <span className="text-red-500 text-xs">
                    {errors.firstName.message}
                  </span>
                )}
              </div>
              <div>
                <label htmlFor="lastName" className="block font-medium mb-1">
                  Last Name
                </label>
                <Controller
                  name="lastName"
                  control={control}
                  render={({ field }) => (
                    <Input id="lastName" placeholder="Last Name" {...field} />
                  )}
                />
                {errors.lastName && (
                  <span className="text-red-500 text-xs">
                    {errors.lastName.message}
                  </span>
                )}
              </div>
            </div>
            <div className="flex justify-end">
              <Button
                type="submit"
                className="bg-[var(--r-blue)] text-white hover:bg-[var(--r-blue)]/90 w-48"
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
