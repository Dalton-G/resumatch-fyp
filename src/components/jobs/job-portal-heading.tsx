"use client";

import { Button } from "../ui/button";
import { pages } from "@/config/directory";
import { useRouter } from "next/navigation";
import { HiMiniSparkles } from "react-icons/hi2";

export default function JobPortalHeading() {
  const router = useRouter();
  return (
    <div className="flex bg-white p-8 border-b-1 border-[var(--r-darkgray)] font-dm-serif justify-between">
      <h1 className="text-3xl">Job Portal</h1>
      <Button
        className="bg-[var(--r-blue)] hover:bg-[var(--r-blue)]/80 text-md"
        onClick={() => router.push(pages.jobMatcher)}
      >
        <HiMiniSparkles />
        AI Job Matching
      </Button>
    </div>
  );
}
