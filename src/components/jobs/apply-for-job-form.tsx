"use client";

import { useJobDetails } from "@/hooks/use-job-details";
import { useMyResume } from "@/hooks/use-my-resume";
import { useGenerateCoverLetter } from "@/hooks/use-generate-cover-letter";
import { JobViewResponse } from "@/lib/types/job-view-response";
import { cleanFilename, formatEnumString } from "@/lib/utils/clean-filename";
import { JobSeekerProfile, Resume } from "@prisma/client";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import axios from "axios";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { pages, api } from "@/config/directory";
import { cn } from "@/lib/utils";
import { FiMapPin } from "react-icons/fi";
import { IoCashOutline } from "react-icons/io5";
import { Loader2, Sparkles } from "lucide-react";
import { useCurrentUserProfile } from "@/hooks/use-profile";
import { useJobApplicationStatus } from "@/hooks/use-job-application-status";
import { useQueryClient } from "@tanstack/react-query";
import { invalidateJobApplicationQueries } from "@/lib/utils/invalidate-cache";
import { LuFileCheck } from "react-icons/lu";

interface ApplyForJobFormProps {
  jobId: string;
  userId: string;
  role: string;
}

const applicationFormSchema = z.object({
  resumeId: z.string().min(1, "Please select a resume"),
  coverLetter: z.string().min(1, "Cover letter is required"),
});

type ApplicationFormType = z.infer<typeof applicationFormSchema>;

export default function ApplyForJobForm({
  jobId,
  userId,
  role,
}: ApplyForJobFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Fetch the user's resume list
  const {
    data: resumeList,
    isLoading: isLoadingResumes,
    isError: isErrorResumes,
  } = useMyResume();

  // Fetch the job details including company information
  const {
    data: jobDetails,
    isLoading: isLoadingJobDetails,
    isError: isErrorJobDetails,
  } = useJobDetails(jobId);

  const {
    data: currentUserProfile,
    isLoading: isLoadingProfile,
    isError: isErrorProfile,
  } = useCurrentUserProfile(userId, role);

  // Check if the user has already applied for this job
  const { data: hasApplied, isLoading: isLoadingHasApplied } =
    useJobApplicationStatus(jobId);

  // Hook for generating cover letter
  const { generateCoverLetter, isGenerating } = useGenerateCoverLetter();

  const resumes = resumeList as Resume[] | undefined;
  const jobDetail = jobDetails as JobViewResponse | undefined;
  const userProfile = currentUserProfile as JobSeekerProfile | undefined;

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
    setValue,
  } = useForm<ApplicationFormType>({
    resolver: zodResolver(applicationFormSchema),
    defaultValues: {
      resumeId: "",
      coverLetter: "",
    },
  });

  const selectedResumeId = watch("resumeId");
  const coverLetter = watch("coverLetter");

  const handleGenerateCoverLetter = async () => {
    if (!selectedResumeId) {
      toast.error("Please select a resume first");
      return;
    }

    const generatedCoverLetter = await generateCoverLetter({
      jobId,
      resumeId: selectedResumeId,
    });

    if (generatedCoverLetter) {
      setValue("coverLetter", generatedCoverLetter);
    }
  };

  const onSubmit = async (data: ApplicationFormType) => {
    const payload = { ...data, jobId, jobSeekerId: userProfile?.id };
    try {
      const response = await axios.post(api.createJobApplication, payload);
      if (response.data.success) {
        toast.success("Application submitted successfully!");
        router.push(pages.myApplications);
      } else {
        toast.error(response.data.error || "Failed to submit application.");
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.error || "Failed to submit application."
      );
    } finally {
      await invalidateJobApplicationQueries(queryClient);
    }
  };

  // Loading/Error states
  if (isLoadingJobDetails || isLoadingResumes) {
    return <div className="p-8 text-center">Loading...</div>;
  }
  if (isErrorJobDetails || isErrorResumes) {
    return (
      <div className="p-8 text-center text-red-500">
        Failed to load job or resume data.
      </div>
    );
  }
  if (!jobDetail) {
    return <div className="p-8 text-center">Job not found.</div>;
  }

  if (isLoadingHasApplied) {
    return (
      <div className="p-8 text-center">Checking application status...</div>
    );
  }

  if (hasApplied) {
    return (
      <div className="flex flex-col gap-6 min-h-[calc(100vh-6rem)] items-center justify-center text-center font-libertinus">
        <LuFileCheck className="text-7xl text-[var(--r-blue)] mb-4" />
        <p className="text-2xl">You have already applied for this job!</p>
        <Button
          className="bg-[var(--r-blue)] hover:bg-[var(--r-blue)]/80 text-lg"
          onClick={() => router.push(pages.myApplications)}
        >
          Go to My Applications
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center bg-[var(--r-gray)] max-h-[calc(100vh-7rem)] overflow-y-auto font-libertinus">
      <div className="w-full max-w-6xl flex flex-col items-start md:flex-row gap-8 mt-12 mb-12 px-4">
        {/* Job Card */}
        <Card className="w-full md:w-1/3 rounded-xl shadow-md flex-shrink-0">
          <CardContent className="px-8 py-8 flex flex-col items-center">
            {/* Company Logo */}
            <div className="w-16 h-16 rounded-full bg-[var(--r-darkgray)] flex items-center justify-center mb-4 overflow-hidden">
              {jobDetail.company.profilePicture ? (
                <img
                  src={jobDetail.company.profilePicture}
                  alt={jobDetail.company.name + " logo"}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <span className="font-bold text-xl text-[var(--r-blue)]">
                  {jobDetail.company.name.charAt(0)}
                </span>
              )}
            </div>
            <div className="text-2xl font-dm-serif text-[var(--r-black)] mb-2 text-center">
              {jobDetail.job.title}
            </div>
            <div className="text-lg text-[var(--r-boldgray)] mb-4">
              {jobDetail.company.name}
            </div>
            <div className="text-black mb-4 text-center">
              {jobDetail.job.description.length > 80
                ? jobDetail.job.description.slice(0, 77) + "..."
                : jobDetail.job.description}
            </div>
            <div className="flex gap-2 mb-4">
              <Badge
                variant="secondary"
                className={cn(
                  jobDetail.job.status === "HIRING"
                    ? "bg-green-100 text-green-800"
                    : jobDetail.job.status === "URGENTLY_HIRING"
                    ? "bg-red-100 text-red-800"
                    : jobDetail.job.status === "CLOSED"
                    ? "bg-slate-200 text-slate-600"
                    : "",
                  "p-2"
                )}
              >
                {formatEnumString(jobDetail.job.status)}
              </Badge>
              <Badge
                variant="secondary"
                className={cn(
                  jobDetail.job.workType === "ONSITE"
                    ? "bg-yellow-100 text-yellow-800"
                    : jobDetail.job.workType === "REMOTE"
                    ? "bg-blue-100 text-blue-800"
                    : jobDetail.job.workType === "HYBRID"
                    ? "bg-purple-100 text-purple-800"
                    : "",
                  "p-2"
                )}
              >
                {jobDetail.job.workType.charAt(0) +
                  jobDetail.job.workType.slice(1).toLowerCase()}
              </Badge>
            </div>
            <div className="flex flex-col gap-2 text-black text-lg mb-4 items-center">
              <span>
                <span className="text-[var(--r-boldgray)] flex items-center">
                  <FiMapPin className="mr-2" />
                  {jobDetail.job.country}
                </span>
              </span>
              <span className="text-[var(--r-boldgray)] flex items-center">
                <IoCashOutline className="mr-2" />
                {jobDetail.job.salaryMin && jobDetail.job.salaryMax
                  ? `RM${jobDetail.job.salaryMin.toLocaleString()} - RM${jobDetail.job.salaryMax.toLocaleString()}`
                  : "-"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Application Form */}
        <form
          className="w-full md:w-2/3 flex flex-col gap-8"
          onSubmit={handleSubmit(onSubmit)}
        >
          {/* Select Resume */}
          <Card className="rounded-xl shadow-md">
            <CardContent className="px-8 py-6">
              <div className="text-xl font-dm-serif text-[var(--r-black)] mb-2">
                Select Your Resume
              </div>
              <div className="text-[var(--r-boldgray)] mb-4">
                Choose your resume you want to submit with the application
              </div>
              <Controller
                name="resumeId"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a Resume" />
                    </SelectTrigger>
                    <SelectContent>
                      {resumes && resumes.length > 0 ? (
                        resumes.map((resume) => (
                          <SelectItem key={resume.id} value={resume.id}>
                            {cleanFilename(resume.fileName)}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="" disabled>
                          No resumes found
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.resumeId && (
                <span className="text-red-500 text-sm mt-2">
                  {errors.resumeId.message}
                </span>
              )}
            </CardContent>
          </Card>

          {/* Cover Letter */}
          <Card className="rounded-xl shadow-md">
            <CardContent className="px-8 py-6">
              <div className="flex justify-between items-center mb-2">
                <div className="text-xl font-dm-serif text-[var(--r-black)]">
                  Cover Letter
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="bg-[var(--r-blue)] text-white hover:bg-[var(--r-blue)]/80"
                  onClick={handleGenerateCoverLetter}
                  disabled={isGenerating || !selectedResumeId}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate with AI
                    </>
                  )}
                </Button>
              </div>
              <div className="text-[var(--r-boldgray)] mb-4">
                Write a personalized cover letter or generate one with AI
              </div>
              <Controller
                name="coverLetter"
                control={control}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    placeholder="Write your cover letter here or click 'Generate with AI' to create one automatically"
                    rows={8}
                    className="h-40"
                    disabled={isGenerating}
                  />
                )}
              />
              {errors.coverLetter && (
                <span className="text-red-500 text-sm mt-2">
                  {errors.coverLetter.message}
                </span>
              )}
            </CardContent>
          </Card>

          {/* Review & Submit */}
          <Card className="rounded-xl shadow-md">
            <CardContent className="px-8 py-6">
              <div className="text-xl font-dm-serif text-[var(--r-black)] mb-2">
                Review & Submit
              </div>
              <div className="text-[var(--r-boldgray)] mb-4">
                Double-check your application before submitting
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <span className="font-semibold">Position:</span>{" "}
                    {jobDetail.job.title}
                  </div>
                  <div className="flex gap-2">
                    <span className="font-semibold">Company:</span>{" "}
                    {jobDetail.company.name}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <span className="font-semibold">Resume:</span>{" "}
                    {selectedResumeId
                      ? cleanFilename(
                          resumes?.find((r) => r.id === selectedResumeId)
                            ?.fileName || ""
                        )
                      : "Not Selected"}
                  </div>
                  <div className="flex gap-2">
                    <span className="font-semibold">Cover Letter:</span>{" "}
                    {coverLetter ? "Written" : "Not Written"}
                  </div>
                </div>
              </div>
              <div className="flex justify-between mt-8">
                <Button
                  type="button"
                  variant="outline"
                  className="font-dm-serif px-8 py-2 bg-[var(--r-gray)] text-[var(--r-black)] w-[180px] hover:border-[var(--r-blue)] trasition-colors"
                  onClick={() => router.push(pages.viewJob(jobId))}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="font-dm-serif px-8 py-2 bg-[var(--r-blue)] text-white w-[180px] hover:bg-[var(--r-blue)]/80"
                  disabled={isGenerating}
                >
                  Submit Now
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}
