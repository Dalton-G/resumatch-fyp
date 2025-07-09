import { Card } from "../ui/card";
import { sidebarIcons } from "@/config/sidebar";

interface UserCardProps {
  name: string;
  image?: string | null;
  role: string;
}

export default function UserCard({ name, image, role }: UserCardProps) {
  const { FaUserCircle } = sidebarIcons;
  return (
    <Card className="flex items-center gap-3 p-3 bg-transparent shadow-none border-none">
      {image ? (
        <img
          src={image}
          alt={name}
          className="w-10 h-10 rounded-full object-cover border border-[var(--r-darkgray)]"
        />
      ) : (
        <div className="w-10 h-10 rounded-full bg-[var(--r-darkgray)] flex items-center justify-center">
          <FaUserCircle className="text-2xl text-white" />
        </div>
      )}
      <div className="flex flex-col">
        <span className="font-libertinus text-sm font-semibold leading-tight text-black">
          {name}
        </span>
        <span className="font-libertinus text-xs text-gray-500 capitalize">
          {role.replace(/_/g, " ").toLowerCase()}
        </span>
      </div>
    </Card>
  );
}
