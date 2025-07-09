import { industryOptions } from "@/config/company-options";
import { z } from "zod";

export const signInSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .min(1, "Email is required")
    .email("Invalid Email Formatting"),

  password: z
    .string({ required_error: "Password is required" })
    .min(1, "Password is required")
    .min(8, "Password must be more than 8 characters")
    .max(32, "Password must be less than 32 characters")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
      message:
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)",
    }),
});

export const jobSeekerSignUpSchema = signInSchema
  .extend({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const companyRegistrationSchema = z
  .object({
    email: z
      .string({ required_error: "Email is required" })
      .min(1, "Email is required")
      .email("Invalid Email Formatting"),
    password: z
      .string({ required_error: "Password is required" })
      .min(1, "Password is required")
      .min(8, "Password must be more than 8 characters")
      .max(32, "Password must be less than 32 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        {
          message:
            "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)",
        }
      ),
    companyName: z.string().min(1, "Company name is required"),
    companyDescription: z.string().min(1, "Company description is required"),
    companyWebsite: z.string().url("Invalid company website URL"),
    companyIndustry: z.string().min(1, "Company industry is required"),
    companySize: z.string().min(1, "Company size is required"),
    companyAddress: z.string().min(1, "Company address is required"),
    companyLogo: z.string().url("Invalid company logo URL"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const adminRegistrationSchema = signInSchema
  .extend({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
