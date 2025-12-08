import { Card, CardContent } from "@/components/ui/card";
import { ProfileAvatar } from "./ProfileAvatar";
import { StatusBadge } from "./StatusBadge";

interface ProfileCardProps {
  name?: string | null;
  email?: string | null;
  picture?: string | null;
  emailVerified?: boolean;
}

export function ProfileCard({
  name,
  email,
  picture,
  emailVerified = false,
}: ProfileCardProps) {
  return (
    <Card className="lg:col-span-1 bg-[#161B22] border-zinc-800/60 shadow-xl shadow-black/25 animate-[fadeInScale_0.6s_ease-out_0.1s_both]">
      <CardContent className="pt-8 pb-8 flex flex-col items-center text-center">
        <ProfileAvatar name={name} picture={picture} />

        <h2 className="text-xl font-semibold text-white mb-1">
          {name || "User"}
        </h2>
        <p className="text-zinc-400 text-sm mb-6">{email}</p>

        <StatusBadge verified={emailVerified} />
      </CardContent>
    </Card>
  );
}

