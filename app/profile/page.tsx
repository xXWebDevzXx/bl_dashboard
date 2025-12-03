import { ProfileContent, ProfileHeader } from "@/components/profile-settings";
import { auth0 } from "@/lib/auth0";
import { ensureUserSynced } from "@/lib/ensure-user-synced";
import { redirect } from "next/navigation";

export default async function Profile() {
  const session = await auth0.getSession();

  if (!session?.user) {
    redirect("/login");
  }

  // Check if account is deleted
  try {
    await ensureUserSynced();
  } catch (error) {
    const err = error as { accountDeleted?: boolean; message?: string };
    if (err?.accountDeleted || err?.message === "ACCOUNT_DELETED") {
      // Account is deleted, redirect to login with flag
      redirect("/login?accountDeleted=true");
    }
  }

  const memberSince = new Date().toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <ProfileHeader
          title="Profile Settings"
          subtitle="Manage your account information and preferences"
        />

        <ProfileContent memberSince={memberSince} />
      </div>
    </div>
  );
}
