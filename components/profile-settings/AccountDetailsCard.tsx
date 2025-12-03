import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { InfoItem } from "./InfoItem";
import { Calendar, Mail, Shield, User } from "lucide-react";

interface AccountDetailsCardProps {
  name?: string | null;
  email?: string | null;
  emailVerified?: boolean;
  memberSince: string;
}

export function AccountDetailsCard({
  name,
  email,
  emailVerified = false,
  memberSince,
}: AccountDetailsCardProps) {
  return (
    <Card className="lg:col-span-2 bg-[#161B22] border-zinc-800/60 shadow-2xl shadow-black/40 animate-[fadeInScale_0.6s_ease-out_0.2s_both]">
      <CardHeader className="border-b border-zinc-800/60">
        <CardTitle className="text-white flex items-center gap-2">
          <User className="w-5 h-5 text-emerald-500" />
          Account Information
        </CardTitle>
        <CardDescription className="text-zinc-400">
          Your personal details and account settings
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <InfoItem
            icon={User}
            label="Full Name"
            value={name || "Not provided"}
            iconColor="text-emerald-500"
            iconBgColor="bg-emerald-500/10"
          />
          <InfoItem
            icon={Mail}
            label="Email Address"
            value={email || "Not provided"}
            iconColor="text-cyan-500"
            iconBgColor="bg-cyan-500/10"
          />
          <InfoItem
            icon={Shield}
            label="Account Status"
            value={emailVerified ? "Verified" : "Unverified"}
            iconColor="text-violet-500"
            iconBgColor="bg-violet-500/10"
          />
          <InfoItem
            icon={Calendar}
            label="Member Since"
            value={memberSince}
            iconColor="text-amber-500"
            iconBgColor="bg-amber-500/10"
          />
        </div>
      </CardContent>
    </Card>
  );
}

