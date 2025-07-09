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

interface ProtectedSidebarProps {
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

  const toggleSection = (label: string) => {
    setOpenSections((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <aside
      className="h-screen w-[260px] flex flex-col border-r bg-white"
      style={{ minWidth: 240 }}
    >
      {/* Logo/Header */}
      <div className="flex items-center gap-3 px-6 py-8 select-none justify-center">
        <Link href={sidebar.home} className="flex items-center gap-3 group">
          <RiStarSmileFill className="text-4xl text-[var(--r-blue)]" />
          <span className="text-2xl font-dm-serif text-[var(--r-black)] group-hover:text-[var(--r-blue)] transition-colors">
            ResuMatch
          </span>
        </Link>
      </div>
      {/* Sidebar Sections */}
      <nav className="flex-1 px-2 space-y-2">
        {sidebar.sections.map((section) => (
          <div key={section.label} className="mb-2">
            <button
              type="button"
              className="flex items-center w-full px-4 py-2 gap-2 text-[var(--r-black)] font-libertinus text-base hover:bg-[var(--r-gray)] rounded-lg transition-colors"
              onClick={() => toggleSection(section.label)}
              aria-expanded={openSections[section.label]}
            >
              <section.icon className="text-xl text-[var(--r-blue)]" />
              <span>{section.label}</span>
              <span className="ml-auto">
                {openSections[section.label] ? (
                  <FiMinus className="text-base" />
                ) : (
                  <FiPlus className="text-base" />
                )}
              </span>
            </button>
            {openSections[section.label] && (
              <div className="ml-8 border-l-2 border-[var(--r-darkgray)] pl-4 mt-1 space-y-1">
                {section.children.map((child) => {
                  const isActive = pathname.startsWith(child.href);
                  return (
                    <Link
                      key={child.href}
                      href={child.href}
                      className={`block py-1.5 px-2 rounded-md font-libertinus text-sm transition-colors ${
                        isActive
                          ? "text-[var(--r-blue)] font-semibold"
                          : "text-[var(--r-black)] hover:bg-[var(--r-gray)] hover:text-[var(--r-blue)]"
                      }`}
                    >
                      {child.label}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </nav>
      {/* User Card Footer */}
      <div className="px-4 py-6 mt-auto">
        <UserCard name={name} image={image} role={role} />
      </div>
    </aside>
  );
}
