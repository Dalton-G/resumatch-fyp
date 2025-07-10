"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  jobSeekerSidebar,
  companySidebar,
  adminSidebar,
  sidebarIcons,
} from "@/config/sidebar";
import UserCard from "@/components/auth/user-card";
import { SidebarConfig } from "@/lib/model/sidebar-model";
import { RiStarSmileFill } from "react-icons/ri";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarMenuButton,
  SidebarGroupContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { Separator } from "../ui/separator";
import { useCurrentUserProfile } from "@/hooks/use-profile";

interface ProtectedSidebarProps {
  id: string;
  role: string;
  name: string;
  image?: string | null;
}

const roleSidebarMap: Record<string, SidebarConfig> = {
  JOB_SEEKER: jobSeekerSidebar,
  COMPANY: companySidebar,
  ADMIN: adminSidebar,
};

export default function ProtectedSidebar({
  id,
  role,
  name,
  image,
}: ProtectedSidebarProps) {
  const pathname = usePathname();
  const sidebar = roleSidebarMap[role] || jobSeekerSidebar;
  const { FiPlus, FiMinus } = sidebarIcons;
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(
    () => {
      // All sections open by default
      const state: Record<string, boolean> = {};
      sidebar.sections.forEach((s) => (state[s.label] = true));
      return state;
    }
  );

  // Fetch latest profile data
  const { data: profile } = useCurrentUserProfile(id, role);

  let displayName = name;
  let profilePicture = image;

  if (role === "JOB_SEEKER" && profile) {
    displayName = [profile.firstName, profile.lastName]
      .filter(Boolean)
      .join(" ");
    profilePicture = profile.profilePicture;
  } else if (role === "COMPANY" && profile) {
    displayName = profile.name;
    profilePicture = profile.logoUrl || profile.profilePicture;
  } else if (role === "ADMIN" && profile) {
    displayName = [profile.firstName, profile.lastName]
      .filter(Boolean)
      .join(" ");
    profilePicture = profile.profilePicture;
  }

  const toggleSection = (label: string) => {
    setOpenSections((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <Sidebar
      collapsible="none"
      className="h-screen w-[260px] flex flex-col border-r bg-white min-w-[240px]"
    >
      <SidebarHeader className="flex items-center gap-3 px-6 py-8 select-none justify-center">
        <Link href={sidebar.home} className="flex items-center gap-3 group">
          <RiStarSmileFill className="text-4xl text-[var(--r-blue)]" />
          <span className="text-3xl font-dm-serif text-[var(--r-black)] group-hover:text-[var(--r-blue)] transition-colors">
            ResuMatch
          </span>
        </Link>
      </SidebarHeader>
      <Separator className="mx-auto max-w-[90%] bg-[var(--r-darkgray)]" />
      <SidebarContent className="flex-1 px-2 space-y-2 mt-6">
        {sidebar.sections.map((section) => (
          <SidebarGroup key={section.label} className="mb-2">
            <SidebarMenuButton
              asChild
              className="flex items-center px-4 py-2 gap-2 text-[var(--r-black)] font-libertinus text-base hover:bg-[var(--r-gray)] rounded-lg transition-colors"
              onClick={() => toggleSection(section.label)}
              aria-expanded={openSections[section.label]}
              isActive={false}
            >
              <button type="button">
                <section.icon className="text-xl text-[var(--r-blue)]" />
                <span className="pl-2">{section.label}</span>
                <span className="ml-auto">
                  {openSections[section.label] ? (
                    <FiMinus className="text-base" />
                  ) : (
                    <FiPlus className="text-base" />
                  )}
                </span>
              </button>
            </SidebarMenuButton>
            {openSections[section.label] && (
              <SidebarGroupContent className="max-w-3/4 ml-6 border-l-1 border-[var(--r-blue)] pl-4 mt-1 space-y-1">
                {section.children.map((child) => {
                  const isActive = pathname.startsWith(child.href);
                  return (
                    <Link
                      key={child.href}
                      href={child.href}
                      className={`block py-1.5 px-2 rounded-md font-libertinus text-sm transition-colors ${
                        isActive
                          ? "text-[var(--r-blue)]"
                          : "text-[var(--r-black)] hover:bg-[var(--r-gray)] hover:text-[var(--r-blue)]"
                      }`}
                    >
                      {child.label}
                    </Link>
                  );
                })}
              </SidebarGroupContent>
            )}
          </SidebarGroup>
        ))}
      </SidebarContent>
      <Separator className="mx-auto max-w-[90%] bg-[var(--r-darkgray)]" />
      <SidebarFooter className="px-4 py-6 mt-auto">
        <UserCard name={displayName} image={profilePicture} role={role} />
      </SidebarFooter>
    </Sidebar>
  );
}
