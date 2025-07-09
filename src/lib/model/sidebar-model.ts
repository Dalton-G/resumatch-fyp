import { IconType } from "react-icons/lib";

export type SidebarChild = {
  label: string;
  href: string;
};

export type SidebarSection = {
  label: string;
  icon: IconType;
  children: SidebarChild[];
};

export type SidebarConfig = {
  home: string;
  sections: SidebarSection[];
};
