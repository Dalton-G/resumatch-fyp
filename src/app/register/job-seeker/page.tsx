import JobSeekerRegisterForm from "@/components/auth/job-seeker-register-form";
import { RiStarSmileFill } from "react-icons/ri";

export default function JobSeekerRegisterPage() {
  return (
    <div className="min-h-svh flex">
      {/* Left: Registration Form */}
      <div className="flex flex-1 flex-col items-center justify-center bg-[var(--r-gray)] px-4">
        <div className="w-full max-w-md mx-auto flex flex-col items-center">
          <h1 className="text-4xl font-dm-serif mb-2 text-center">
            Job Seeker Registration
          </h1>
          <p className="mb-8 text-center font-libertinus text-base font-medium">
            Create your <span className="text-[var(--r-blue)]">ResuMatch</span>{" "}
            account to find your dream job
          </p>
          <JobSeekerRegisterForm />
        </div>
      </div>
      {/* Right: Branding */}
      <div className="hidden md:flex w-1/2 flex-col items-center justify-center bg-[var(--r-blue)] text-white">
        <div className="flex flex-col items-center">
          <RiStarSmileFill size={120} className="text-white" />
          <div className="text-center mt-4">
            <h2 className="text-5xl font-dm-serif">ResuMatch</h2>
            <p className="mt-2 text-2xl font-libertinus font-light">
              Where jobs find <i>you</i>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
