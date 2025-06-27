"use client";

import { useState, useRef } from "react";
import RecruiterStepper from "@/components/auth/recruiter-stepper";
import RecruiterPersonalForm from "@/components/auth/recruiter-personal-form";
import RecruiterCompanyForm from "@/components/auth/recruiter-company-form";
import { recruiterRegistrationSchema } from "@/schema/auth-schema";
import { RiStarSmileFill } from "react-icons/ri";

const initialPersonalData = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  confirmPassword: "",
};
const initialCompanyData = {
  companyName: "",
  companyDescription: "",
  companyWebsite: "",
  companyIndustry: "",
  companySize: "",
  companyAddress: "",
  companyLogo: "",
};

export default function RecruiterRegisterPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [personalData, setPersonalData] = useState<any>(initialPersonalData);
  const [companyData, setCompanyData] = useState<any>(initialCompanyData);
  const personalFormRef = useRef<any>(null);

  async function handlePersonalContinue(data: any) {
    setPersonalData((prev: any) => ({ ...prev, ...data }));
    setStep(2);
  }

  function handleCompanySubmit(data: any) {
    setCompanyData((prev: any) => ({ ...prev, ...data }));
    // Validate combined data
    const result = recruiterRegistrationSchema.safeParse({
      ...personalData,
      ...data,
    });
    if (result.success) {
      console.log({ ...personalData, ...data });
    } else {
      // Optionally handle errors here
      alert("Validation failed. Please check your inputs.");
    }
  }

  async function handleStepClick(newStep: 1 | 2) {
    if (step === 1 && newStep === 2 && personalFormRef.current) {
      const valid = await personalFormRef.current.validateAndContinue();
      if (valid) setStep(2);
    } else if (step === 2 && newStep === 1) {
      setStep(1);
    }
  }

  return (
    <div className="min-h-svh flex">
      {/* Left: Registration Form */}
      <div className="flex flex-1 flex-col items-center justify-center bg-[var(--r-gray)] px-4">
        <div className="w-full max-w-md mx-auto flex flex-col items-center">
          <h1 className="text-4xl font-bold font-dm-serif mb-2 text-center">
            Recruiter Registration
          </h1>
          <p className="mb-8 text-center font-libertinus text-base font-medium">
            Create your <span className="text-[var(--r-blue)]">ResuMatch</span>{" "}
            recruiter account
          </p>
          <RecruiterStepper currentStep={step} onStepClick={handleStepClick} />
          {step === 1 ? (
            <RecruiterPersonalForm
              ref={personalFormRef}
              initialValues={personalData}
              onContinue={handlePersonalContinue}
            />
          ) : (
            <RecruiterCompanyForm
              initialValues={companyData}
              onSubmit={handleCompanySubmit}
            />
          )}
          <p className="text-center text-sm font-libertinus mt-8">
            Already have an account?{" "}
            <a
              href="/auth/login"
              className="text-[var(--r-blue)] underline-offset-2 hover:underline"
            >
              Login
            </a>
          </p>
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
