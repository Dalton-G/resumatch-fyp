import { HiOutlineDocumentText } from "react-icons/hi";
import { LuBriefcaseBusiness, LuInbox } from "react-icons/lu";
import { FaUserCog, FaUserCircle } from "react-icons/fa";
import { FiPlus, FiMinus } from "react-icons/fi";
import { pages } from "./directory";
import { SidebarConfig } from "@/lib/model/sidebar-model";

export const jobSeekerSidebar: SidebarConfig = {
  home: pages.jobPortal,
  sections: [
    {
      label: "Jobs",
      icon: LuBriefcaseBusiness,
      children: [
        { label: "Job Portal", href: pages.jobPortal },
        { label: "Job Matcher", href: pages.jobMatcher },
      ],
    },
    {
      label: "Resume",
      icon: HiOutlineDocumentText,
      children: [
        { label: "My Resumes", href: pages.myResume },
        { label: "Resume Optimizer", href: pages.resumeOptimizer },
      ],
    },
    {
      label: "Applications",
      icon: LuInbox,
      children: [{ label: "My Applications", href: pages.myApplications }],
    },
  ],
};

export const companySidebar: SidebarConfig = {
  home: pages.jobPortal,
  sections: [
    {
      label: "Jobs",
      icon: LuBriefcaseBusiness,
      children: [
        { label: "My Job Postings", href: pages.myJobPostings },
        { label: "Job Portal", href: pages.jobPortal },
      ],
    },
    {
      label: "Applicants",
      icon: LuInbox,
      children: [{ label: "Rank Applicants", href: pages.rankApplicants }],
    },
  ],
};

export const adminSidebar: SidebarConfig = {
  home: pages.jobPortal,
  sections: [
    {
      label: "Jobs",
      icon: LuBriefcaseBusiness,
      children: [
        { label: "Job Portal", href: pages.jobPortal },
        { label: "Manage Jobs", href: pages.manageJobs },
      ],
    },
    {
      label: "Users",
      icon: FaUserCog,
      children: [{ label: "Manage Users", href: pages.manageUsers }],
    },
  ],
};

export const sidebarIcons = { FiPlus, FiMinus, FaUserCircle };
