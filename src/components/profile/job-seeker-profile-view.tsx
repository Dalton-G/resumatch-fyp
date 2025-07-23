import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FaEye,
  FaEnvelope,
  FaGithub,
  FaLinkedin,
  FaLink,
  FaPhoneAlt,
  FaUserCircle,
} from "react-icons/fa";

interface JobSeekerProfileViewProps {
  name: string;
  image: string | null;
  profession: string | null;
  country: string | null;
  views: number;
  bio: string;
  skills: string[];
  phone: string | null;
  email: string | null;
  githubUrl: string | null;
  linkedinUrl: string | null;
  portfolioUrl: string | null;
}

export default function JobSeekerProfileView({
  name,
  image,
  profession,
  country,
  views,
  bio,
  skills,
  phone,
  email,
  githubUrl,
  linkedinUrl,
  portfolioUrl,
}: JobSeekerProfileViewProps) {
  return (
    <div>
      <div className="flex w-full gap-8 justify-center items-start mt-8 px-8">
        {/* Left Card */}
        <Card className="flex flex-col items-center flex-1 py-10 px-8 rounded-2xl shadow-lg bg-[var(--color-card)] min-w-0">
          {image ? (
            <img
              src={image}
              alt="Profile"
              className="w-48 h-48 rounded-full object-cover border-4 border-[var(--color-border)] mb-4"
            />
          ) : (
            <div className="w-48 h-48 rounded-full bg-[var(--r-darkgray)] flex items-center justify-center mb-4 border-4 border-[var(--color-border)]">
              <FaUserCircle className="text-7xl text-white shrink-0" />
            </div>
          )}
          <div
            className="text-4xl font-bold mb-0"
            style={{ fontFamily: "var(--font-dm-serif)" }}
          >
            {name}
          </div>
          <div className="text-3xl text-[var(--r-boldgray)] font-dm-serif -mt-2">
            {profession || "N/A"}
          </div>
          <div className="text-xl text-black mb-4 font-libertinus -mt-2">
            {country || "N/A"}
          </div>
          <div className="flex items-center gap-2 mb-6 -mt-2">
            <span className="inline-flex items-center px-3 font-libertinus bg-[var(--r-gray)] rounded-full text-base font-medium text-[var(--color-primary)]">
              <FaEye className="mr-2 text-[var(--color-primary)]" />
              {views} views
            </span>
          </div>
          <hr className="w-full border-t border-[var(--color-border)] mb-4" />
          <div className="text-[var(--r-blue)] text-2xl mb-2 font-dm-serif">
            About Me
          </div>
          <div className="text-center text-xl text-[var(--color-primary)] whitespace-pre-line font-libertinus -mt-2">
            {bio}
          </div>
        </Card>

        {/* Right Column */}
        <div className="flex flex-col gap-6 flex-1 min-w-0">
          {/* Skills Card */}
          <Card className="p-6 rounded-2xl shadow bg-[var(--color-card)]">
            <div className="text-[var(--r-blue)] font-dm-serif text-2xl mb-1">
              Skills
            </div>
            <div className="flex flex-wrap gap-2">
              {skills && skills.length > 0 ? (
                skills.map((skill, idx) => (
                  <Badge
                    key={idx}
                    className="rounded-full px-3 py-1 bg-[var(--r-gray)] text-[var(--color-primary)] text-base font-medium font-libertinus"
                  >
                    {skill}
                  </Badge>
                ))
              ) : (
                <span className="text-muted-foreground">N/A</span>
              )}
            </div>
          </Card>
          {/* Contacts Card */}
          <Card className="p-6 rounded-2xl shadow bg-[var(--color-card)]">
            <div className="text-[var(--r-blue)] font-dm-serif text-2xl mb-1">
              Contacts
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 text-xl font-libertinus">
                <FaPhoneAlt className="text-[var(--color-primary)] mr-2" />
                {phone || <span className="text-muted-foreground">N/A</span>}
              </div>
              <div className="flex items-center gap-3 text-xl font-libertinus">
                <FaEnvelope className="text-[var(--color-primary)] mr-2" />
                {email || <span className="text-muted-foreground">N/A</span>}
              </div>
            </div>
          </Card>
          {/* Socials Card */}
          <Card className="p-6 rounded-2xl shadow bg-[var(--color-card)]">
            <div className="text-[var(--r-blue)] font-dm-serif text-2xl mb-1">
              Socials
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 text-xl font-libertinus">
                <FaGithub className="text-[var(--color-primary)] mr-2" />
                {githubUrl ? (
                  <a
                    href={githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline text-[var(--color-primary)]"
                  >
                    {githubUrl}
                  </a>
                ) : (
                  <span className="text-muted-foreground">N/A</span>
                )}
              </div>
              <div className="flex items-center gap-3 text-xl font-libertinus">
                <FaLinkedin className="text-[var(--color-primary)] mr-2" />
                {linkedinUrl ? (
                  <a
                    href={linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline text-[var(--color-primary)]"
                  >
                    {linkedinUrl}
                  </a>
                ) : (
                  <span className="text-muted-foreground">N/A</span>
                )}
              </div>
              <div className="flex items-center gap-3 text-xl font-libertinus">
                <FaLink className="text-[var(--color-primary)] mr-2" />
                {portfolioUrl ? (
                  <a
                    href={portfolioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline text-[var(--color-primary)]"
                  >
                    {portfolioUrl}
                  </a>
                ) : (
                  <span className="text-muted-foreground">N/A</span>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
