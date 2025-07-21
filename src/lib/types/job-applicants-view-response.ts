import { ApplicationStatus } from "@prisma/client";

export interface JobApplicantsResponse {
  applications: JobApplication[];
  length: number;
}

export interface JobApplication {
  id: string;
  jobId: string;
  resumeId: string;
  coverLetter: string | null;
  status: ApplicationStatus;
  appliedAt: string;
  updatedAt: string;
  jobSeekerId: string;
  feedback: string | null;
  notes: string | null;
  jobSeeker: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    profession: string | null;
    profilePicture: string | null;
    userId: string;
  };
  resume: {
    id: string;
    fileName: string;
  };
}
