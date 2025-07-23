"use client";
import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ProfilePictureUploader from "@/components/upload/profile-picture-uploader";
import { useCurrentUserProfile } from "@/hooks/use-profile";
import type { JobSeekerProfile } from "@prisma/client";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";
import { api, pages } from "@/config/directory";
import { useQueryClient } from "@tanstack/react-query";
import { cacheKeys } from "@/config/cache-keys";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { countryOptions } from "@/config/country-options";

const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  profession: z.string().optional(),
  country: z.string().optional(),
  bio: z.string().optional(),
  profilePicture: z.string().min(1, "Profile picture is required"),
  skills: z.string().array().optional(),
  linkedinUrl: z.string().optional(),
  githubUrl: z.string().optional(),
  portfolioUrl: z.string().optional(),
  phone: z.string().optional(),
});

type ProfileFormType = z.infer<typeof profileSchema>;

export default function JobSeekerEditProfile({
  userId,
  role,
}: {
  userId: string;
  role: string;
}) {
  // All hooks must be called unconditionally
  const queryClient = useQueryClient();
  const {
    data: profile,
    isLoading,
    isError,
  } = useCurrentUserProfile(userId, role);
  const [tab, setTab] = useState("profile");
  const [skillsInput, setSkillsInput] = useState("");
  const [profilePicture, setProfilePicture] = useState<string | undefined>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Default values for form (safe fallback)
  const jobSeekerProfile = (profile || {}) as Partial<JobSeekerProfile>;
  const defaultValues: ProfileFormType = {
    firstName: jobSeekerProfile.firstName || "",
    lastName: jobSeekerProfile.lastName || "",
    profession: jobSeekerProfile.profession || "",
    country: jobSeekerProfile.country || "",
    bio: jobSeekerProfile.bio || "",
    profilePicture: jobSeekerProfile.profilePicture || "",
    skills: jobSeekerProfile.skills || [],
    linkedinUrl: jobSeekerProfile.linkedinUrl || "",
    githubUrl: jobSeekerProfile.githubUrl || "",
    portfolioUrl: jobSeekerProfile.portfolioUrl || "",
    phone: jobSeekerProfile.phone || "",
  };

  useEffect(() => {
    if (jobSeekerProfile.profilePicture) {
      setProfilePicture(jobSeekerProfile.profilePicture);
    } else {
      setProfilePicture("");
    }
  }, [jobSeekerProfile.profilePicture, userId, role]);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProfileFormType>({
    resolver: zodResolver(profileSchema),
    defaultValues,
  });

  // Watch for skills
  const skills = watch("skills");

  // Handle profile picture upload
  const handleProfilePictureUpload = (fileUrl: string) => {
    setValue("profilePicture", fileUrl, { shouldValidate: true });
    setProfilePicture(fileUrl);
  };
  // Handle profile picture delete
  const handleProfilePictureDelete = () => {
    setValue("profilePicture", "", { shouldValidate: true });
    setProfilePicture("");
  };

  // Handle add skill
  const handleAddSkill = () => {
    const trimmed = skillsInput.trim();
    if (trimmed && !skills?.includes(trimmed)) {
      setValue("skills", [...(skills || []), trimmed], {
        shouldValidate: true,
      });
      setSkillsInput("");
    }
  };
  // Handle remove skill
  const handleRemoveSkill = (skill: string) => {
    setValue(
      "skills",
      (skills || []).filter((s) => s !== skill),
      { shouldValidate: true }
    );
  };

  // Handle save
  const onSubmit = async (data: ProfileFormType) => {
    setIsSubmitting(true);
    try {
      const res = await axiosInstance.put(
        `${api.editProfile}?userId=${userId}&role=${role}`,
        data
      );
      if (res.status === 200) {
        toast.success("Profile updated successfully!");
        if (res.data?.jobSeekerProfile?.profilePicture) {
          setProfilePicture(res.data.jobSeekerProfile.profilePicture);
        }
      } else {
        toast.error(res.data?.error || "Failed to update profile");
      }
    } catch (e: any) {
      toast.error(e.response?.data?.error || "Failed to update profile");
    } finally {
      setIsSubmitting(false);
      queryClient.invalidateQueries({ queryKey: [cacheKeys.profile] });
    }
  };

  // Only render loading/error UI after all hooks
  if (isLoading) {
    return <div className="p-8">Loading profile...</div>;
  }
  if (isError || !profile) {
    return <div className="p-8 text-red-500">Failed to load profile.</div>;
  }

  return (
    <div className="flex flex-col gap-4 max-w-7xl mx-auto">
      <div className="flex flex-row gap-8 p-8 font-libertinus">
        <div className="flex-1">
          <Tabs value={tab} onValueChange={setTab} className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="skills">Skills</TabsTrigger>
              <TabsTrigger value="socials">Socials</TabsTrigger>
            </TabsList>
            <TabsContent value="profile">
              <Card>
                <CardContent className="p-6 space-y-6">
                  <div>
                    <label className="block font-medium mb-4">
                      Profile Picture
                    </label>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="firstName"
                        className="block font-medium mb-1"
                      >
                        First Name
                      </label>
                      <Controller
                        name="firstName"
                        control={control}
                        render={({ field }) => (
                          <Input
                            id="firstName"
                            placeholder="First Name"
                            {...field}
                          />
                        )}
                      />
                      {errors.firstName && (
                        <span className="text-red-500 text-xs">
                          {errors.firstName.message}
                        </span>
                      )}
                    </div>
                    <div>
                      <label
                        htmlFor="lastName"
                        className="block font-medium mb-1"
                      >
                        Last Name
                      </label>
                      <Controller
                        name="lastName"
                        control={control}
                        render={({ field }) => (
                          <Input
                            id="lastName"
                            placeholder="Last Name"
                            {...field}
                          />
                        )}
                      />
                      {errors.lastName && (
                        <span className="text-red-500 text-xs">
                          {errors.lastName.message}
                        </span>
                      )}
                    </div>
                    <div>
                      <label
                        htmlFor="profession"
                        className="block font-medium mb-1"
                      >
                        Profession
                      </label>
                      <Controller
                        name="profession"
                        control={control}
                        render={({ field }) => (
                          <Input
                            id="profession"
                            placeholder="Profession"
                            {...field}
                          />
                        )}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="country"
                        className="block font-medium mb-1"
                      >
                        Country
                      </label>
                      <Controller
                        name="country"
                        control={control}
                        render={({ field }) => (
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select a country" />
                            </SelectTrigger>
                            <SelectContent>
                              {countryOptions.map((country) => (
                                <SelectItem key={country} value={country}>
                                  {country}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.country && (
                        <span className="text-red-500 text-xs">
                          {errors.country.message}
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <label htmlFor="bio" className="block font-medium mb-1">
                      Bio
                    </label>
                    <Controller
                      name="bio"
                      control={control}
                      render={({ field }) => (
                        <Textarea
                          id="bio"
                          placeholder="Bio"
                          rows={4}
                          {...field}
                        />
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="skills">
              <Card>
                <CardContent className="p-6 space-y-4">
                  <div className="flex gap-2 items-center">
                    <Input
                      placeholder="Add A New Skill"
                      value={skillsInput}
                      onChange={(e) => setSkillsInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddSkill();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      onClick={handleAddSkill}
                      className="bg-[var(--r-blue)]"
                    >
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 min-h-[48px]">
                    {(skills || []).map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center pl-4 pr-2 py-1 rounded-full bg-[var(--r-gray)] text-sm font-medium"
                      >
                        {skill}
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="ml-1 rounded-full hover:bg-[var(--r-darkgray)]/20 text-lg"
                          onClick={() => handleRemoveSkill(skill)}
                        >
                          ×
                        </Button>
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="socials">
              <Card>
                <CardContent className="p-6 space-y-4">
                  <div>
                    <label
                      htmlFor="linkedinUrl"
                      className="block font-medium mb-1"
                    >
                      Linkedin URL
                    </label>
                    <Controller
                      name="linkedinUrl"
                      control={control}
                      render={({ field }) => (
                        <Input
                          id="linkedinUrl"
                          placeholder="Linkedin URL"
                          {...field}
                        />
                      )}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="githubUrl"
                      className="block font-medium mb-1"
                    >
                      GitHub URL
                    </label>
                    <Controller
                      name="githubUrl"
                      control={control}
                      render={({ field }) => (
                        <Input
                          id="githubUrl"
                          placeholder="GitHub URL"
                          {...field}
                        />
                      )}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="portfolioUrl"
                      className="block font-medium mb-1"
                    >
                      Your Website
                    </label>
                    <Controller
                      name="portfolioUrl"
                      control={control}
                      render={({ field }) => (
                        <Input
                          id="portfolioUrl"
                          placeholder="Your Website"
                          {...field}
                        />
                      )}
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block font-medium mb-1">
                      Phone Number
                    </label>
                    <Controller
                      name="phone"
                      control={control}
                      render={({ field }) => (
                        <Input
                          id="phone"
                          placeholder="Phone Number"
                          {...field}
                        />
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        <div className="w-80 flex flex-col gap-4 mt-17">
          <Card className="mb-4">
            <CardContent className="p-4 flex flex-col gap-2">
              <Button
                variant={tab === "profile" ? "outline" : "ghost"}
                onClick={() => setTab("profile")}
              >
                Profile
              </Button>
              <Button
                variant={tab === "skills" ? "outline" : "ghost"}
                onClick={() => setTab("skills")}
              >
                Skills
              </Button>
              <Button
                variant={tab === "socials" ? "outline" : "ghost"}
                onClick={() => setTab("socials")}
              >
                Socials
              </Button>
            </CardContent>
          </Card>
          <Link href={`${pages.viewProfile}/${userId}`}>
            <Button
              className="w-full text-black mb-2 bg-white border-1 hover:border-[var(--r-blue)] hover:bg-white"
              variant="default"
            >
              View Profile
            </Button>
          </Link>
          <Button
            className="w-full bg-[var(--r-blue)] text-white hover:bg-[var(--r-blue)]/90"
            size="lg"
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
