import { Card, CardContent } from "@/components/ui/card";
import React from "react";
import Image from "next/image";
import { HiOutlineBuildingOffice2 } from "react-icons/hi2";
import { BiCategory } from "react-icons/bi";
import { BiGroup } from "react-icons/bi";
import { Button } from "../ui/button";

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
      <CardContent className="py-8 px-12 flex flex-col gap-4">
        <div className="flex items-center font-libertinus text-xl mb-2">
          <HiOutlineBuildingOffice2 className="mr-2 w-6 h-6" />
          About the company
        </div>
        <div className="flex gap-2">
          <div className="flex flex-col min-w-[6rem]">
            {company.profilePicture ? (
              <Image
                src={company.profilePicture}
                alt={company.name}
                width={480}
                height={480}
                className="rounded-full object-cover w-24 h-24 p-2"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-lg font-bold">
                {company.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>
            )}
          </div>
          <div className="flex flex-col ml-2 gap-2">
            <span className="mt-2 text-2xl font-dm-serif truncate max-w-[80ch]">
              {company.name}
            </span>
            <div className="text-lg text-[var(--r-black)] line-clamp-2 mb-2">
              {company.description || "n/a"}
            </div>
            <div className="flex gap-24">
              <div className="flex items-center gap-1  text-[var(--r-boldgray)]">
                <BiCategory className="inline-block mr-1 w-6 h-6" />
                <span className="text-lg">{company.industry || "n/a"}</span>
              </div>
              <div className="flex items-center gap-1 text-[var(--r-boldgray)]">
                <BiGroup className="inline-block mr-1 w-6 h-6" />
                <span className="text-lg">{company.size || "n/a"}</span>
              </div>
            </div>
            <Button
              onClick={onViewProfile}
              className="mt-4 text-lg hover:bg-[var(--r-blue)]/10 w-full"
              variant="secondary"
            >
              View Company Profile
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
