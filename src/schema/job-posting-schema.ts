import { JobStatus, WorkType } from "@prisma/client";
import z from "zod";

export const jobPostingSchema = z.object({
  title: z.string().min(1, "Job title is required"),
  description: z.string().min(1, "Job description is required"),
  country: z.string().min(1, "Country is required"),
  workType: z.nativeEnum(WorkType, {
    errorMap: () => ({ message: "Invalid work type" }),
  }),
  status: z.nativeEnum(JobStatus, {
    errorMap: () => ({ message: "Invalid status" }),
  }),
  salaryMin: z.number().min(1, "Salary Min is required"),
  salaryMax: z.number().min(1, "Salary Max is required"),
});
