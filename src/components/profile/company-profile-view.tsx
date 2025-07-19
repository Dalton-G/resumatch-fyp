import { Card } from "@/components/ui/card";
import { FaBuilding, FaEye, FaEnvelope, FaGlobe } from "react-icons/fa";
import { CompanyJobList } from "@/components/jobs/company-job-list";

interface CompanyProfileViewProps {
  name: string;
  profilePicture: string | null;
  industry: string | null;
  size: string | null;
  address: string | null;
  views: number;
  website: string | null;
  email: string | null;
  description: string | null;
  userId: string; // Added companyId prop
}

export default function CompanyProfileView({
  name,
  profilePicture,
  industry,
  size,
  address,
  views,
  website,
  email,
  description,
  userId, // Destructure companyId
}: CompanyProfileViewProps) {
  return (
    <div className="flex flex-col gap-8 w-full px-8 mt-8">
      {/* Header Section */}
      <Card className="flex flex-row items-center gap-8 p-10 rounded-2xl shadow-lg bg-[var(--color-card)]">
        {/* Logo */}
        {profilePicture ? (
          <img
            src={profilePicture}
            alt="Company Logo"
            className="w-40 h-40 rounded-full object-cover border-4 border-[var(--color-border)]"
          />
        ) : (
          <div className="w-40 h-40 rounded-full bg-[var(--r-darkgray)] flex items-center justify-center border-4 border-[var(--color-border)]">
            <FaBuilding className="text-7xl text-white" />
          </div>
        )}
        {/* Info */}
        <div className="flex flex-col gap-2 flex-1 min-w-0">
          <div className="text-4xl font-dm-serif truncate">{name || "N/A"}</div>
          <div className="text-2xl text-[var(--r-blue)] font-dm-serif">
            {industry || "N/A"}
          </div>
          <div className="text-lg text-muted-foreground font-libertinus">
            {size || "N/A"}
          </div>
          <div className="text-lg text-muted-foreground font-libertinus">
            {address || "N/A"}
          </div>
          <div className="flex items-center gap-10 mt-2">
            <span className="inline-flex items-center px-3 font-libertinus bg-[var(--r-gray)] rounded-full text-base font-medium text-[var(--color-primary)]">
              <FaEye className="mr-2 text-[var(--color-primary)]" />
              {views} views
            </span>
            <span className="flex items-center gap-2 text-lg font-libertinus">
              <FaGlobe className="text-[var(--color-primary)]" />
              {website ? (
                <a
                  href={website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline text-[var(--color-primary)]"
                >
                  {website}
                </a>
              ) : (
                <span className="text-muted-foreground">N/A</span>
              )}
            </span>
            <span className="flex items-center gap-2 text-lg font-libertinus">
              <FaEnvelope className="text-[var(--color-primary)]" />
              {email || <span className="text-muted-foreground">N/A</span>}
            </span>
          </div>
        </div>
      </Card>

      {/* Description Section */}
      <Card className="p-8 rounded-2xl shadow bg-[var(--color-card)]">
        <div className="text-[var(--r-blue)] font-dm-serif text-2xl mb-2">
          Description
        </div>
        <div className="text-xl text-[var(--color-primary)] font-libertinus min-h-[40px]">
          {description || <span className="text-muted-foreground">N/A</span>}
        </div>
      </Card>

      {/* Active Jobs Section in a Card */}
      <Card className="p-8 rounded-2xl shadow bg-[var(--color-card)]">
        <div className="text-[var(--r-blue)] font-dm-serif text-2xl mb-2">
          Active Job Postings
        </div>
        <CompanyJobList userId={userId} />
      </Card>
    </div>
  );
}
