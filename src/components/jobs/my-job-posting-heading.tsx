"use client";

import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { pages } from "@/config/directory";
import { BiEdit } from "react-icons/bi";

export default function MyJobPostingsHeading() {
  const router = useRouter();
  return (
    <div className="flex bg-white p-8 border-b-1 border-[var(--r-darkgray)] font-dm-serif justify-between">
      <h1 className="text-3xl">My Job Postings</h1>
      <Button
        className="bg-[var(--r-blue)] hover:bg-[var(--r-blue)]/80"
        onClick={() => router.push(pages.createJob)}
      >
        <BiEdit />
        Create New Job
      </Button>
    </div>
  );
}
