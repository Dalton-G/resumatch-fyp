import JobImageUploader from "@/components/upload/job-image-uploader";
import ProfilePictureUploader from "@/components/upload/profile-picture-uploader";
import ResumeUploader from "@/components/upload/resume-uploader";

export default async function TestPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <ProfilePictureUploader />
      <ResumeUploader />
      <JobImageUploader />
    </div>
  );
}
