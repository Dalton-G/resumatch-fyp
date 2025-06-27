import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { signInWithGoogle } from "@/actions/auth";

export default function GoogleButton({
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <form action={signInWithGoogle}>
      <button
        type="submit"
        className={cn(
          "w-full flex items-center justify-center gap-2 bg-white border border-gray-300 rounded-md py-2 px-4 shadow-sm hover:bg-gray-100 transition text-sm font-semibold font-libertinus text-gray-800",
          className
        )}
        {...props}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g clipPath="url(#clip0_993_156)">
            <path
              d="M19.805 10.2305C19.805 9.55078 19.7483 8.86719 19.6266 8.19922H10.2V12.0492H15.6199C15.3899 13.2793 14.6699 14.3301 13.6199 15.0293V17.0293H16.6199C18.4199 15.3691 19.805 13.0492 19.805 10.2305Z"
              fill="#4285F4"
            />
            <path
              d="M10.2 20C12.6999 20 14.7899 19.1699 16.6199 17.0293L13.6199 15.0293C12.6199 15.7295 11.4199 16.1299 10.2 16.1299C7.78992 16.1299 5.78992 14.3896 5.06992 12.1699H2.06992V14.2295C3.88992 17.3691 6.88992 20 10.2 20Z"
              fill="#34A853"
            />
            <path
              d="M5.06992 12.1699C4.86992 11.4697 4.76992 10.7295 4.76992 9.99998C4.76992 9.27051 4.88992 8.53027 5.06992 7.83008V5.77051H2.06992C1.38992 7.08984 1.00001 8.50977 1.00001 9.99998C1.00001 11.4902 1.38992 12.9102 2.06992 14.2295L5.06992 12.1699Z"
              fill="#FBBC05"
            />
            <path
              d="M10.2 3.87012C11.5399 3.87012 12.7599 4.3291 13.7199 5.23926L16.6899 2.26953C14.7899 0.509766 12.6999 0 10.2 0C6.88992 0 3.88992 2.63086 2.06992 5.77051L5.06992 7.83008C5.78992 5.61035 7.78992 3.87012 10.2 3.87012Z"
              fill="#EA4335"
            />
          </g>
          <defs>
            <clipPath id="clip0_993_156">
              <rect width="20" height="20" fill="white" />
            </clipPath>
          </defs>
        </svg>
        <span className="font-libertinus">Sign In with Google</span>
      </button>
    </form>
  );
}
