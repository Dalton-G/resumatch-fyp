import { FaCheck } from "react-icons/fa";

export default function RecruiterStepper({
  currentStep,
  onStepClick,
}: {
  currentStep: 1 | 2;
  onStepClick: (step: 1 | 2) => void;
}) {
  return (
    <div className="flex items-center justify-center gap-8 mb-8">
      {/* Step 1 */}
      <button
        type="button"
        onClick={() => onStepClick(1)}
        className="flex flex-col items-center focus:outline-none"
      >
        <div
          className={`w-8 h-8 flex items-center justify-center rounded-full border-2 ${
            currentStep === 1
              ? "bg-[var(--r-blue)] text-white border-[var(--r-blue)]"
              : "bg-white text-[var(--r-blue)] border-gray-300"
          }`}
        >
          {currentStep === 2 ? <FaCheck size={18} /> : 1}
        </div>
        <span className="mt-2 text-sm font-semibold font-libertinus">
          Personal Details
        </span>
        <span className="text-xs text-muted-foreground font-libertinus">
          Your information
        </span>
      </button>
      {/* Divider */}
      <div className="h-0.5 w-16 bg-gray-300" />
      {/* Step 2 */}
      <button
        type="button"
        onClick={() => onStepClick(2)}
        className="flex flex-col items-center focus:outline-none"
      >
        <div
          className={`w-8 h-8 flex items-center justify-center rounded-full border-2 ${
            currentStep === 2
              ? "bg-[var(--r-blue)] text-white border-[var(--r-blue)]"
              : "bg-white text-gray-700 border-gray-300"
          }`}
        >
          2
        </div>
        <span className="mt-2 text-sm font-semibold font-libertinus">
          Company Details
        </span>
        <span className="text-xs text-muted-foreground font-libertinus">
          About your organization
        </span>
      </button>
    </div>
  );
}
