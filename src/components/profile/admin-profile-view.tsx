import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FaUserShield, FaEye, FaEnvelope } from "react-icons/fa";

interface AdminProfileViewProps {
  firstName: string | null;
  lastName: string | null;
  profilePicture: string | null;
  email: string | null;
  views: number;
}

export default function AdminProfileView({
  firstName,
  lastName,
  profilePicture,
  email,
  views,
}: AdminProfileViewProps) {
  const fullName = [firstName, lastName].filter(Boolean).join(" ") || "N/A";
  return (
    <div className="flex justify-center items-start w-full px-8 mt-12">
      <Card className="flex flex-col items-center w-full max-w-xl py-10 px-8 rounded-2xl shadow-lg bg-[var(--color-card)]">
        {/* Profile Picture */}
        {profilePicture ? (
          <img
            src={profilePicture}
            alt="Admin Profile"
            className="w-40 h-40 rounded-full object-cover border-4 border-[var(--color-border)] mb-4"
          />
        ) : (
          <div className="w-40 h-40 rounded-full bg-[var(--r-darkgray)] flex items-center justify-center mb-4 border-4 border-[var(--color-border)]">
            <FaUserShield className="text-7xl text-white" />
          </div>
        )}
        {/* Name and Badge */}
        <Badge className="bg-[var(--r-blue)] text-white text-base font-dm-serif px-3 py-1 rounded-full">
          Admin
        </Badge>
        <div className="flex items-center gap-3 mb-2">
          <div className="text-4xl font-bold font-dm-serif">{fullName}</div>
        </div>
        {/* Email */}
        <div className="flex items-center gap-2 text-xl font-libertinus mb-2">
          <FaEnvelope className="text-[var(--color-primary)] mr-2" />
          {email || <span className="text-muted-foreground">N/A</span>}
        </div>
        {/* Views */}
        <div className="flex items-center gap-2 mt-2">
          <span className="inline-flex items-center px-3 font-libertinus bg-[var(--r-gray)] rounded-full text-base font-medium text-[var(--color-primary)]">
            <FaEye className="mr-2 text-[var(--color-primary)]" />
            {views} views
          </span>
        </div>
      </Card>
    </div>
  );
}
