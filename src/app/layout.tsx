import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";
import {
  fontDMSerif,
  fontDMSerifItalic,
  fontLibertinus,
} from "../../public/fonts";
import { Toaster } from "sonner";
import QueryProvider from "@/components/provider/query-provider";

export const metadata: Metadata = {
  title: {
    default:
      "ResuMatch - AI-Powered Job Matching & Resume Optimization Platform",
    template: "%s | ResuMatch",
  },
  description:
    "Transform your career with ResuMatch's AI-powered job matching platform. Get personalized job recommendations, optimize your resume with AI feedback, and connect with top employers. Start your dream career today.",
  keywords: [
    "AI job matching",
    "resume optimization",
    "job search platform",
    "career development",
    "AI resume feedback",
    "job recommendations",
    "employment platform",
    "resume builder",
    "job portal",
    "career matching",
    "professional networking",
    "job hunting",
    "resume analysis",
    "AI recruitment",
    "job marketplace",
  ],
  authors: [{ name: "ResuMatch Team" }],
  creator: "ResuMatch",
  publisher: "ResuMatch",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
  },
  category: "technology",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "antialiased",
        fontLibertinus.variable,
        fontDMSerif.variable,
        fontDMSerifItalic.variable
      )}
      suppressHydrationWarning
    >
      <body>
        <QueryProvider>{children}</QueryProvider>
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
