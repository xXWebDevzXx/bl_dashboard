import AdminDashboardClient from "@/components/admin/AdminDashboardClient";
import { getAdminUser } from "@/lib/admin";
import { auth0 } from "@/lib/auth0";
import { ensureUserSynced } from "@/lib/ensure-user-synced";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const session = await auth0.getSession();

  // If user is not authenticated, redirect to login
  if (!session?.user) {
    redirect("/login");
  }

  // If email is not verified, redirect to verify-email page
  if (!session.user.email_verified) {
    redirect("/verify-email");
  }

  // Sync user to database if not already synced
  try {
    await ensureUserSynced();
  } catch (error) {
    const err = error as { accountDeleted?: boolean; message?: string };
    if (err?.accountDeleted || err?.message === "ACCOUNT_DELETED") {
      redirect("/login?accountDeleted=true");
    }
    throw error;
  }

  // Check if user is admin
  const adminUser = await getAdminUser();

  if (!adminUser) {
    // Not an admin, redirect to dashboard
    redirect("/dashboard");
  }

  return (
    <div className="p-4 sm:p-6 desktop:p-8 max-w-7xl mx-auto w-full overflow-x-hidden">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          Admin Dashboard
        </h1>
        <p className="text-zinc-400 text-sm sm:text-base">
          Manage users and system settings
        </p>
      </div>
      <AdminDashboardClient />
    </div>
  );
}
