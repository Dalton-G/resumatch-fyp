"use client";

import { use } from "react";
import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import { api } from "@/config/directory";
import JobSeekerProfileView from "@/components/profile/job-seeker-profile-view";
import CompanyProfileView from "@/components/profile/company-profile-view";
// import AdminProfileView from '@/components/profile/admin-profile-view';

interface ViewProfilePageProps {
  params: Promise<{ userId: string }>;
}

export default function ViewProfilePage({ params }: ViewProfilePageProps) {
  const { userId } = use(params);

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setError("No userId provided");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    axios
      .get(`${api.profile}/${userId}`)
      .then((res) => setProfile(res.data))
      .catch((err) => {
        setError(err?.response?.data?.error || "Failed to load profile");
        setProfile(null);
      })
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!profile) return <div>Profile not found</div>;

  switch (profile.role) {
    case "JOB_SEEKER":
      return (
        <JobSeekerProfileView
          name={profile.name}
          image={profile.image}
          profession={profile.profession}
          location={profile.location}
          views={profile.views}
          bio={profile.bio}
          skills={profile.skills}
          phone={profile.phone}
          email={profile.email}
          githubUrl={profile.githubUrl}
          linkedinUrl={profile.linkedinUrl}
          portfolioUrl={profile.portfolioUrl}
        />
      );
    case "COMPANY":
      return (
        <CompanyProfileView
          name={profile.name}
          profilePicture={profile.profilePicture}
          industry={profile.industry}
          size={profile.size}
          address={profile.address}
          views={profile.views}
          website={profile.website}
          email={profile.email}
          description={profile.description}
        />
      );
    case "ADMIN":
      // return <AdminProfileView {...profile} />;
      return <div>Admin Profile View (to be implemented)</div>;
    default:
      return <div>Unknown profile type</div>;
  }
}
