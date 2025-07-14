export interface ResumeChunkMetadata {
  content: string;
  metadata: {
    jobSeekerId: string;
    resumeId: string;
    chunkIndex: number;
    totalChunks: number;
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

export interface EmbeddedResumeChunkMetadata extends ResumeChunkMetadata {
  id: string;
  embedding: number[];
}
