import {
  AccountDetailsCard,
  ProfileActions,
  ProfileCard,
  ProfileHeader,
} from "@/components/profile-settings";
import { auth0 } from "@/lib/auth0";
import { redirect } from "next/navigation";

export default async function Profile() {
  const session = await auth0.getSession();

  if (!session?.user) {
    redirect("/login");
  }

  const user = session.user;
  const memberSince = new Date().toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-[#0D1117] p-8">
      {/* Background gradient effect */}
      <div className="fixed inset-0 bg-gradient-to-br from-emerald-950/20 via-transparent to-cyan-950/20 pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto">
        <ProfileHeader
          title="Profile Settings"
          subtitle="Manage your account information and preferences"
        />

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
      </div>
    </div>
  );
}
