type BaseUserCreationModel = {
  name: string;
  email: string;
  password: string;
};

export type JobSeekerProfileCreationModel = {
  firstName: string;
  lastName: string;
};

export type CompanyProfileCreationModel = {};

export type AdminProfileCreationModel = {};

export type JobSeekerUserCreationModel = BaseUserCreationModel & {
  role: "JOB_SEEKER";
  jobSeekerProfile: JobSeekerProfileCreationModel;
};

export type CompanyUserCreationModel = BaseUserCreationModel & {
  role: "RECRUITER";
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
