import { Card, CardContent } from "@/components/ui/card";
import React from "react";
import Image from "next/image";

interface AboutCompanyCardProps {
  company: {
    name: string;
    description?: string | null;
    profilePicture?: string | null;
    industry?: string | null;
    size?: string | null;
    website?: string | null;
  };
  onViewProfile: () => void;
}

export function AboutCompanyCard({
  company,
  onViewProfile,
}: AboutCompanyCardProps) {
  return (
    <Card className="p-0">
      <CardContent className="p-6 flex flex-col gap-4">
        <div className="font-bold text-lg mb-2">About the company</div>
        <div className="flex items-center gap-3 mb-2">
          {company.profilePicture ? (
            <Image
              src={company.profilePicture}
              alt={company.name}
              width={40}
              height={40}
              className="rounded-full object-cover w-10 h-10"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-lg font-bold">
              {company.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
          )}
          <span className="text-lg font-semibold truncate max-w-[16ch]">
            {company.name}
          </span>
        </div>
        <div className="text-base text-[var(--r-black)] line-clamp-2 mb-2">
          {company.description || "n/a"}
        </div>
        <div className="flex gap-6 text-base text-gray-700 mb-2">
          <span>
            Industry:{" "}
            <span className="font-semibold">{company.industry || "n/a"}</span>
          </span>
          <span>
            Size: <span className="font-semibold">{company.size || "n/a"}</span>
          </span>
        </div>
        <div className="text-base text-gray-700 mb-2">
          Website:{" "}
          <span className="font-semibold">{company.website || "n/a"}</span>
        </div>
        <button
          className="bg-gray-100 hover:bg-gray-200 rounded px-4 py-2 text-[var(--r-blue)] font-semibold w-fit"
          onClick={onViewProfile}
        >
          View Company Profile
        </button>
      </CardContent>
    </Card>
  );
}
