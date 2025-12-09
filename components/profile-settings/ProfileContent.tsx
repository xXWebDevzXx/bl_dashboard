"use client";

import { useAuthUser } from "@/hooks/useAuthUser";
import { AccountDetailsCard } from "./AccountDetailsCard";
import { ProfileActions } from "./ProfileActions";
import { ProfileCard } from "./ProfileCard";
import { Loader2 } from "lucide-react";

interface ProfileContentProps {
  memberSince: string;
}

export function ProfileContent({ memberSince }: ProfileContentProps) {
  const { user, isLoading } = useAuthUser();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <ProfileCard
        name={user.name}
        email={user.email}
        picture={user.picture}
        emailVerified={user.email_verified}
      />

      <AccountDetailsCard
        name={user.name}
        email={user.email}
        emailVerified={user.email_verified}
        memberSince={memberSince}
      />

      <ProfileActions />
    </div>
  );
}


