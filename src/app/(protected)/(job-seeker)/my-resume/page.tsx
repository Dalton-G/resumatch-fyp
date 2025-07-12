import ResumeHeading from "@/components/resume/resume-heading";
import ResumeSidebar from "@/components/resume/resume-sidebar";

export default function ManageResume() {
  return (
    <div>
      <ResumeHeading />
      <div className="flex flex-row">
        <ResumeSidebar />
        <div className="flex-1">
          <h1>Resume</h1>
        </div>
      </div>
    </div>
  );
}
