import { LoginForm } from "@/components/auth/login-form";
import { RiStarSmileFill } from "react-icons/ri";

export default function Home() {
  return (
    <div className="min-h-svh flex items-center justify-center bg-[var(--r-gray)] p-4">
      <div className="flex w-full max-w-4xl rounded-2xl shadow-lg overflow-hidden bg-white">
        {/* Left: Login Form */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-8">
          <LoginForm />
        </div>
        {/* Right: Branding */}
        <div className="hidden md:flex w-1/2 flex-col items-center justify-center bg-[var(--r-blue)] text-white p-8">
          <div className="flex flex-col items-center">
            <RiStarSmileFill size={80} className="text-white" />
            <div className="text-center">
              <h2 className="text-3xl font-dm-serif">ResuMatch</h2>
              <p className="mt-1 text-base font-libertinus font-light">
                Where jobs find <i>you</i>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
