"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertTriangle, CheckCircle } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

interface ReportJobModalProps {
  jobId: string;
  jobTitle: string;
  companyName: string;
  isOpen: boolean;
  onClose: () => void;
}

const REPORT_REASONS = [
  { value: "SPAM", label: "Spam or fraudulent posting" },
  { value: "INAPPROPRIATE_CONTENT", label: "Inappropriate content" },
  { value: "MISLEADING_INFORMATION", label: "Misleading job information" },
  { value: "DISCRIMINATION", label: "Discriminatory content" },
  { value: "FAKE_JOB", label: "Fake or non-existent job" },
  { value: "OTHER", label: "Other violation" },
];

export default function ReportJobModal({
  jobId,
  jobTitle,
  companyName,
  isOpen,
  onClose,
}: ReportJobModalProps) {
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const queryClient = useQueryClient();

  const reportJobMutation = useMutation({
    mutationFn: async (data: { reason: string; description: string }) => {
      const response = await axios.post("/api/job-reports/create", {
        jobId,
        reason: data.reason,
        description: data.description,
      });
      return response.data;
    },
    onSuccess: () => {
      setSubmitted(true);
      toast.success("Report submitted successfully");
      // Clear the form after a delay
      setTimeout(() => {
        handleClose();
      }, 2000);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error || "Failed to submit report");
    },
  });

  const handleSubmit = () => {
    if (!reason || !description.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    reportJobMutation.mutate({ reason, description });
  };

  const handleClose = () => {
    setReason("");
    setDescription("");
    setSubmitted(false);
    onClose();
  };

  if (submitted) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <DialogTitle className="text-xl text-green-700">
                Report Submitted
              </DialogTitle>
            </div>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600">
              Thank you for reporting this job posting. Our team will review it
              and take appropriate action if necessary.
            </p>
            <p className="text-sm text-gray-500">
              This dialog will close automatically...
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="w-6 h-6 text-orange-500" />
            <DialogTitle className="text-xl">Report Job Posting</DialogTitle>
          </div>
          <DialogDescription className="text-gray-600">
            Report "{jobTitle}" at {companyName} for policy violations or
            inappropriate content.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Reason for reporting *
            </label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {REPORT_REASONS.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Description *
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please provide more details about the issue..."
              rows={4}
              maxLength={500}
            />
            <div className="text-xs text-gray-500 mt-1">
              {description.length}/500 characters
            </div>
          </div>

          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
            <strong>Note:</strong> False reports may result in restrictions on
            your account. Only report jobs that genuinely violate our community
            guidelines.
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleSubmit}
              disabled={
                reportJobMutation.isPending || !reason || !description.trim()
              }
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              {reportJobMutation.isPending ? "Submitting..." : "Submit Report"}
            </Button>
            <Button variant="outline" onClick={handleClose} className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
