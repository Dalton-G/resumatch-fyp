"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { pages } from "@/config/directory";
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

// Enum values from prisma schema
export const workTypeOptions = [
  { value: "FULL_TIME", label: "Full Time" },
  { value: "PART_TIME", label: "Part Time" },
  { value: "CONTRACT", label: "Contract" },
  { value: "INTERNSHIP", label: "Internship" },
  { value: "TEMPORARY", label: "Temporary" },
];
export const jobStatusOptions = [
  { value: "HIRING", label: "Hiring" },
  { value: "CLOSED", label: "Closed" },
  { value: "PAUSED", label: "Paused" },
];

const jobFormSchema = z.object({
  title: z.string().min(1, "Job title is required"),
  description: z.string().min(1, "Job description is required"),
  location: z.string().min(1, "Location is required"),
  workType: z.string().min(1, "Work type is required"),
  status: z.string().min(1, "Status is required"),
  salaryMin: z.coerce.number().min(1, "Salary Min is required"),
  salaryMax: z.coerce.number().min(1, "Salary Max is required"),
});

export type JobFormType = z.infer<typeof jobFormSchema>;

export default function CreateJobForm() {
  const router = useRouter();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<JobFormType>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      workType: "",
      status: "",
      salaryMin: undefined,
      salaryMax: undefined,
    },
  });

  const onSubmit = (data: JobFormType) => {
    console.log("Create Job Data:", data);
  };

  return (
    <div className="flex justify-center items-start min-h-screen bg-[var(--r-gray)] font-libertinus">
      <Card className="w-full max-w-2xl mt-12 mb-12 mx-4 rounded-xl shadow-md">
        <CardContent className="px-10 py-8">
          <h2 className="text-2xl font-dm-serif font-bold text-[var(--r-black)] mb-2">
            Job Details
          </h2>
          <p className="font-libertinus text-[var(--r-boldgray)] font-semibold mb-8">
            Fill in the information about your job description
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
                <label className="block font-medium mb-2">Location:</label>
                <Controller
                  name="location"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} placeholder="Enter location" />
                  )}
                />
                {errors.location && (
                  <span className="text-red-500 text-sm">
                    {errors.location.message}
                  </span>
                )}
              </div>
              <div>
                <label className="block font-medium mb-2">Work Type:</label>
                <Controller
                  name="workType"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
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
                  )}
                />
                {errors.workType && (
                  <span className="text-red-500 text-sm">
                    {errors.workType.message}
                  </span>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
              <div>
                <label className="block font-medium mb-2">Salary Min:</label>
                <Controller
                  name="salaryMin"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="number"
                      placeholder="Minimum salary"
                      min={0}
                    />
                  )}
                />
                {errors.salaryMin && (
                  <span className="text-red-500 text-sm">
                    {errors.salaryMin.message}
                  </span>
                )}
              </div>
              <div>
                <label className="block font-medium mb-2">Salary Max:</label>
                <Controller
                  name="salaryMax"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="number"
                      placeholder="Maximum salary"
                      min={0}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
              <div>
                <label className="block font-medium mb-2">Status:</label>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {jobStatusOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
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
                className="font-bold px-8 py-2 bg-[var(--r-gray)] text-[var(--r-black)]"
                onClick={() => router.push(pages.myJobPostings)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="font-bold px-8 py-2 bg-[var(--r-blue)] text-white"
              >
                Create Job
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
