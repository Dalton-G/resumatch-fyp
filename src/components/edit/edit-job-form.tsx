"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { pages, api } from "@/config/directory";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  workTypeOptions,
  companyUpdateJobStatusOptions,
} from "@/config/job-posting-options";
import { Separator } from "../ui/separator";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { cacheKeys } from "@/config/cache-keys";
import { useState } from "react";
import { countryOptions } from "@/config/country-options";
import axios from "@/lib/axios";

const jobFormSchema = z.object({
  title: z.string().min(1, "Job title is required"),
  description: z.string().min(1, "Job description is required"),
  country: z.string().min(1, "Country is required"),
  workType: z.string().min(1, "Work type is required"),
  status: z.string().min(1, "Status is required"),
  salaryMin: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number().min(1, "Salary Min is required")
  ),
  salaryMax: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number().min(1, "Salary Max is required")
  ),
});

export type JobFormType = {
  title: string;
  description: string;
  country: string;
  workType: string;
  status: string;
  salaryMin: string | number;
  salaryMax: string | number;
};

// Accept job details directly from parent
export type EditJobFormProps = {
  job: {
    id: string;
    title: string;
    description: string;
    country: string;
    workType: string;
    status: string;
    salaryMin: string | number;
    salaryMax: string | number;
  };
};

export default function EditJobForm({ job }: EditJobFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isUpdating, setIsUpdating] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      title: job.title,
      description: job.description,
      country: job.country,
      workType: job.workType,
      status: job.status,
      salaryMin: job.salaryMin,
      salaryMax: job.salaryMax,
    },
  });

  const onSubmit = async (formData: any) => {
    const payload = {
      ...formData,
      salaryMin: Number(formData.salaryMin),
      salaryMax: Number(formData.salaryMax),
      workType: formData.workType,
      status: formData.status,
    };
    try {
      setIsUpdating(true);
      const response = await axios.patch(api.updateJob(job.id), payload);
      if (response.status === 200) {
        // Show different messages based on what was updated
        const analysis = response.data._analysis;

        if (analysis?.embeddingAction === "regenerated") {
          toast.success(
            "Job posting updated successfully! Embeddings regenerated for better search results."
          );
        } else if (analysis?.embeddingAction === "metadata_updated") {
          toast.success(
            "Job posting updated successfully! Status updated in search index."
          );
        } else {
          toast.success("Job posting updated successfully!");
        }

        queryClient.invalidateQueries({
          queryKey: [cacheKeys.jobPostings],
        });
        queryClient.invalidateQueries({
          queryKey: [cacheKeys.myJobPostings],
        });
        router.push(pages.myJobPostings);
      }
    } catch (error: any) {
      if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error("Failed to update job posting. Please try again.");
      }
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex justify-center items-start bg-[var(--r-gray)] font-libertinus">
      <Card className="w-full max-w-2xl mt-12 mb-12 mx-4 rounded-xl shadow-md">
        <CardContent className="px-10 py-8">
          <h2 className="text-2xl font-dm-serif text-[var(--r-black)] mb-2">
            Edit Job Details
          </h2>
          <p className="font-libertinus text-[var(--r-boldgray)] mb-8">
            Update the information about your job posting
          </p>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-6">
              <label className="block font-medium mb-2">Job Title:</label>
              <Controller
                name="title"
                control={control}
                render={({ field }) => (
                  <Input {...field} placeholder="Enter job title" />
                )}
              />
              {errors.title && (
                <span className="text-red-500 text-sm">
                  {errors.title.message}
                </span>
              )}
            </div>
            <div className="mb-6">
              <label className="block font-medium mb-2">Job Description:</label>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    placeholder="Enter job description"
                    rows={5}
                    className="resize-none h-32"
                  />
                )}
              />
              {errors.description && (
                <span className="text-red-500 text-sm">
                  {errors.description.message}
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
              <div>
                <label className="block font-medium mb-2">Country:</label>
                <Controller
                  name="country"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
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
                  <span className="text-red-500 text-sm">
                    {errors.country.message}
                  </span>
                )}
              </div>
              <div>
                <label className="block font-medium mb-2">Work Type:</label>
                <Controller
                  name="workType"
                  control={control}
                  render={({ field }) => {
                    return (
                      <Select
                        key={job.id || "empty-worktype"}
                        value={field.value ?? ""}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select work type" />
                        </SelectTrigger>
                        <SelectContent>
                          {workTypeOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    );
                  }}
                />
                {errors.workType && (
                  <span className="text-red-500 text-sm">
                    {errors.workType.message}
                  </span>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
              {/* Salary Range */}
              <div className="flex gap-6">
                <div>
                  <label className="font-medium mb-2">Salary Min:</label>
                  <Controller
                    name="salaryMin"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        value={
                          typeof field.value === "string" ||
                          typeof field.value === "number"
                            ? String(field.value)
                            : ""
                        }
                        type="number"
                        placeholder="Min Salary"
                        min={0}
                        className="mt-2"
                      />
                    )}
                  />
                  {errors.salaryMin && (
                    <span className="text-red-500 text-sm">
                      {errors.salaryMin.message}
                    </span>
                  )}
                </div>
                <Separator
                  orientation="horizontal"
                  className="max-w-3 -mx-3 mt-12 border-1 border-[var(--r-darkgray)]"
                />
                <div>
                  <label className="font-medium mb-2">Salary Max:</label>
                  <Controller
                    name="salaryMax"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        value={
                          typeof field.value === "string" ||
                          typeof field.value === "number"
                            ? String(field.value)
                            : ""
                        }
                        type="number"
                        placeholder="Max Salary"
                        min={0}
                        className="mt-2"
                      />
                    )}
                  />
                  {errors.salaryMax && (
                    <span className="text-red-500 text-sm">
                      {errors.salaryMax.message}
                    </span>
                  )}
                </div>
              </div>
              {/* Status */}
              <div>
                <label className="block font-medium mb-2">Status:</label>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => {
                    return (
                      <Select
                        key={job.id || "empty-status"}
                        value={field.value ?? ""}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          {companyUpdateJobStatusOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    );
                  }}
                />
                {errors.status && (
                  <span className="text-red-500 text-sm">
                    {errors.status.message}
                  </span>
                )}
              </div>
            </div>
            <div className="flex justify-between mt-8">
              <Button
                type="button"
                variant="outline"
                className="font-dm-serif px-8 py-2 bg-[var(--r-gray)] text-[var(--r-black)] w-[280px] hover:border-[var(--r-blue)] trasition-colors"
                onClick={() => router.push(pages.myJobPostings)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="font-dm-serif px-8 py-2 bg-[var(--r-blue)] text-white w-[280px] hover:bg-[var(--r-blue)]/80"
                disabled={isUpdating}
              >
                Update Job
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
