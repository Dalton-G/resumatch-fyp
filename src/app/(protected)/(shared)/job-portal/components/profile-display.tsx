"use client";

import { useCurrentUserProfile } from "@/hooks/use-profile";

type ProfileDisplayProps = {
  userId: string;
  role: string;
};

export default function ProfileDisplay({ userId, role }: ProfileDisplayProps) {
  const {
    data: profile,
    isLoading,
    error,
  } = useCurrentUserProfile(userId, role);

  if (isLoading) return <div>Loading profile...</div>;

  if (error)
    return <div>Error loading profile: {(error as Error).message}</div>;

  return (
    <div className="mt-4">
      <h2 className="text-xl font-bold">Profile Information</h2>
      <pre className="mt-2 p-4 bg-gray-100 rounded-md overflow-auto">
        {JSON.stringify(profile, null, 2)}
      </pre>
    </div>
  );
}
