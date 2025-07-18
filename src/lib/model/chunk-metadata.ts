export interface ResumeMetadata {
  content: string;
  metadata: {
    jobSeekerId: string;
    resumeId: string;
    source: string;
    appliedJobIds: string[];
  };
}

export interface JobPostingChunkMetadata {
  content: string;
  metadata: {
    companyId: string;
    jobId: string;
    chunkIndex: string;
    totalChunks: number;
    source: string;
    active: boolean;
  };
}

export interface EmbeddedResumeMetadata extends ResumeMetadata {
  id: string;
  embedding: number[];
}
