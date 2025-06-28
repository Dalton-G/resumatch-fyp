import Link from "next/link";
import { Card } from "@/components/ui/card";
import { RiStarSmileFill } from "react-icons/ri";
import { LuBriefcase } from "react-icons/lu";
import { BiGroup } from "react-icons/bi";

export default function RegisterPage() {
  return (
    <div className="min-h-svh flex">
      {/* Left: Role Selection */}
      <div className="flex flex-1 flex-col items-center justify-center bg-[var(--r-gray)] px-4">
        <div className="w-full max-w-md mx-auto flex flex-col items-center">
          <h1 className="text-4xl font-bold font-dm-serif mb-2 text-center">
            Create an Account
          </h1>
          <p className="mb-8 text-center font-libertinus text-base font-medium">
            Choose your account type to get started with{" "}
            <span className="text-[var(--r-blue)]">ResuMatch</span>
          </p>
          <div className="flex flex-col gap-4 w-full">
            <Link href="/auth/register/job-seeker" className="group">
              <Card className="flex flex-row items-center justify-between p-5 cursor-pointer transition-colors border border-gray-200  group-hover:border-[var(--r-blue)]">
                <div>
                  <div className="font-bold font-libertinus text-lg">
                    I'm a Job Seeker
                  </div>
                  <div className="text-sm font-libertinus text-gray-600">
                    Looking for new job opportunities
                  </div>
                </div>
                <LuBriefcase size={32} className="text-[var(--r-blue)]" />
              </Card>
            </Link>
            <Link href="/auth/register/recruiter" className="group">
              <Card className="flex flex-row items-center justify-between p-5 cursor-pointer transition-colors border border-gray-200  group-hover:border-[var(--r-blue)]">
                <div>
                  <div className="font-bold font-libertinus text-lg">
                    I'm a Recruiter
                  </div>
                  <div className="text-sm font-libertinus text-gray-600">
                    Hiring Talent for my organization
                  </div>
                </div>
                <BiGroup size={32} className="text-[var(--r-blue)]" />
              </Card>
            </Link>
          </div>
          <div className="mt-8 text-center text-sm font-libertinus">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="text-[var(--r-blue)] underline-offset-2 hover:underline"
            >
              Login
            </Link>
          </div>
        </div>
      </div>
      {/* Right: Branding */}
      <div className="hidden md:flex w-1/2 flex-col items-center justify-center bg-[var(--r-blue)] text-white">
        <div className="flex flex-col items-center">
          <RiStarSmileFill size={120} className="text-white" />
          <div className="text-center mt-4">
            <h2 className="text-5xl font-bold font-dm-serif">ResuMatch</h2>
            <p className="mt-2 text-2xl font-libertinus font-light">
              Where jobs find <i>you</i>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
