import { ApplicationStatus, JobStatus, WorkType } from "@prisma/client";

export type JobApplicationViewResponse = {
  application: {
    id: string;
    jobId: string;
    resumeId: string;
    jobSeekerId: string;
    coverLetter: string | null;
    feedback: string | null;
    notes: string | null;
    status: ApplicationStatus;
    appliedAt: Date;
    updatedAt: Date;

    jobSeeker: {
      id: string;
      firstName: string | null;
      lastName: string | null;
      profession: string | null;
      profilePicture: string | null;
      userId: string;
    };

    job: {
      id: string;
      title: string;
      description: string;
      status: JobStatus;
      country: string;
      salaryMin: number | null;
      salaryMax: number | null;
      workType: WorkType;
      company: {
        id: string;
        name: string;
        profilePicture: string | null;
      };
    };

    resume: {
      id: string;
      fileName: string;
      s3Url: string;
    };
  };
};
