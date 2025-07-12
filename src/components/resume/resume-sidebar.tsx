import { Separator } from "@radix-ui/react-separator";
import ResumeUploader from "../upload/resume-uploader";

export default function ResumeSidebar() {
  return (
    <div className="w-1/6 bg-white p-8 border-r-1 border-[var(--r-darkgray)] min-h-screen">
      <div className="flex flex-col gap-4">
        <ResumeUploader />
        <Separator className="my-4 border-[var(--r-darkgray)] border-1" />
      </div>
    </div>
  );
}
