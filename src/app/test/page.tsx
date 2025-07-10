import ProfilePictureUploader from "@/components/upload/profile-picture-uploader";

export default async function TestPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <ProfilePictureUploader />
    </div>
  );
}
