import { Card } from "../ui/card";
import { sidebarIcons } from "@/config/sidebar";
import SignOutOfAllProvidersButton from "./sign-out-of-all-providers";
import Link from "next/link";
import { pages } from "@/config/directory";

interface UserCardProps {
  name: string;
  image?: string | null;
  role: string;
}

export default function UserCard({ name, image, role }: UserCardProps) {
  const { FaUserCircle } = sidebarIcons;
  return (
    <Link href={pages.editProfile} tabIndex={-1}>
      <Card className="flex items-center p-3 shadow-sm cursor-pointer transition hover:border-[var(--r-blue)]">
        <div className="flex gap-3 items-center">
          <div className="flex-1">
            {image ? (
              <img
                src={image}
                alt={name}
                className="w-10 h-10 rounded-full object-cover border border-[var(--r-darkgray)]"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-[var(--r-darkgray)] flex items-center justify-center">
                <FaUserCircle className="text-2xl text-white shrink-0" />
              </div>
            )}
          </div>
          <div className="flex-2">
            <div className="flex flex-col items-start justify-center flex-grow">
              <span className="font-dm-serif text-sm text-black truncate whitespace-nowrap overflow-hidden min-w-[90px] max-w-[90px]">
                {name}
              </span>
              <span className="font-dm-serif text-xs text-muted-foreground capitalize truncate whitespace-nowrap overflow-hidden min-w-[90px] max-w-[90px]">
                {role.replace(/_/g, " ").toLowerCase()}
              </span>
            </div>
          </div>
          {/* Prevent sign out button from triggering navigation */}
          <div className="flex-1">
            <div
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              className="ml-auto"
            >
              <SignOutOfAllProvidersButton />
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
