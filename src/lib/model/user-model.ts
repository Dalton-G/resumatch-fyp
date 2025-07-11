import { JobSeekerProfile } from "@prisma/client";

type BaseUserCreationModel = {
  name: string;
  email: string;
  password: string;
  image?: string;
};

export type JobSeekerProfileCreationModel = {
  firstName: string;
  lastName: string;
};

export type CompanyProfileCreationModel = {
  name: string;
  description: string;
  website: string;
  industry: string;
  size: string;
  address: string;
  profilePicture: string;
};

export type AdminProfileCreationModel = {
  firstName: string;
  lastName: string;
};

export type JobSeekerUserCreationModel = BaseUserCreationModel & {
  role: "JOB_SEEKER";
  jobSeekerProfile: JobSeekerProfileCreationModel;
};

export type CompanyUserCreationModel = BaseUserCreationModel & {
  role: "COMPANY";
  companyProfile: CompanyProfileCreationModel;
};

export type AdminUserCreationModel = BaseUserCreationModel & {
  role: "ADMIN";
  adminProfile: AdminProfileCreationModel;
};

export type UserCreationModel =
  | JobSeekerUserCreationModel
  | CompanyUserCreationModel
  | AdminUserCreationModel;
