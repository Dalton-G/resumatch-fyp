import { useMutation } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";
import { api } from "@/config/directory";
import { isAxiosError } from "axios";

interface GenerateCoverLetterParams {
  jobId: string;
  resumeId: string;
}

interface GenerateCoverLetterResponse {
  coverLetter: string;
}

const generatedCoverLetterAPI = async ({
  jobId,
  resumeId,
}: GenerateCoverLetterParams): Promise<string> => {
  const { data } = await axiosInstance.post<GenerateCoverLetterResponse>(
    api.generateCoverLetter,
    { jobId, resumeId }
  );
  return data.coverLetter;
};

export function useGenerateCoverLetter() {
  const mutation = useMutation({
    mutationFn: generatedCoverLetterAPI,
    onSuccess: () => {
      toast.success("Cover letter generated successfully!");
    },
    onError: (error) => {
      console.error("Error generating cover letter:", error);

      let errorMessage = "Failed to generate cover letter. Please try again.";

      if (isAxiosError(error)) {
        errorMessage =
          error.response?.data?.error || error.message || errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    },
  });
  const generateCoverLetter = async ({
    jobId,
    resumeId,
  }: GenerateCoverLetterParams) => {
    if (!jobId || !resumeId) {
      toast.error(
        "Job ID and Resume ID are required to generate a cover letter."
      );
      return null;
    }
    try {
      const coverLetter = await mutation.mutateAsync({ jobId, resumeId });
      return coverLetter;
    } catch (error) {
      // error already handled in onError
      return null;
    }
  };

  return {
    generateCoverLetter,
    isGenerating: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset,
  };
}
