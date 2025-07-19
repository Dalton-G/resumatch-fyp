export interface ResumeMetadata {
  content: string;
  metadata: {
    jobSeekerId: string;
    resumeId: string;
    source: string;
    appliedJobIds: string[];
    country: string;
    profession: string;
  };
}

export interface JobPostingMetadata {
  content: string;
  metadata: {
    companyId: string;
    jobId: string;
    source: string;
    active: boolean;
    position: string;
    salaryMin: number;
    salaryMax: number;
    workType: string;
    country: string;
  };
}

export interface EmbeddedResumeMetadata extends ResumeMetadata {
  id: string;
  embedding: number[];
}

export interface EmbeddedJobPostingMetadata extends JobPostingMetadata {
  id: string;
  embedding: number[];
}
