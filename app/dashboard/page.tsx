import DashboardAreaChart from "@/components/dashboard/DashboardAreaChart";
import DashboardCard from "@/components/dashboard/DashboardCard";
import DashboardCircleChart from "@/components/dashboard/DashboardCircleChart";
import { auth0 } from "@/lib/auth0";
import { getDashboardStats } from "@/lib/dashboard-stats";
import { ensureUserSynced } from "@/lib/ensure-user-synced";
import { redirect } from "next/navigation";

// Force dynamic rendering for auth and database operations
export const dynamic = "force-dynamic";

export default async function Dashboard() {
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
  // This runs in Node.js runtime, so Prisma works here
  try {
    await ensureUserSynced();
  } catch (error) {
    const err = error as { accountDeleted?: boolean; message?: string };
    if (err?.accountDeleted || err?.message === "ACCOUNT_DELETED") {
      // Account is deleted, redirect to login with flag
      redirect("/login?accountDeleted=true");
    }
    throw error;
  }

  // Fetch dashboard stats
  const {
    linearTasksCount,
    linearTasksWithTogglTimePercentage,
    averageTogglTimeHours,
    linearTasksWithDelegatePercentage,
  } = await getDashboardStats();

  return (
    <div className="p-8">
      <div className="grid grid-cols-4 gap-8 mb-8">
        <DashboardCard
          className="rounded-sm"
          bigText={`${linearTasksCount} tasks`}
          smallText="seneste år"
        ></DashboardCard>
        <DashboardCard
          className="rounded-sm"
          bigText={`${linearTasksWithTogglTimePercentage.toFixed(2)}%`}
          smallText="AI tasks vs non-AI tasks"
        ></DashboardCard>
        <DashboardCard
          className="rounded-sm"
          bigText={`${averageTogglTimeHours.toFixed(2)} hrs`}
          smallText="gennemsnitlig tid pr. task"
        ></DashboardCard>
        <DashboardCard
          className="rounded-sm"
          bigText={`${linearTasksWithDelegatePercentage.toFixed(2)}%`}
          smallText="AI-assisteret opgaver"
        ></DashboardCard>
      </div>
      <div className="grid grid-cols-2 gap-8">
        <div className="grid gap-8 auto-rows-auto mb-8">
          <DashboardAreaChart className="bg-[#1A1F26] p-4 rounded-sm"></DashboardAreaChart>
          <DashboardCard className="rounded-sm"></DashboardCard>
        </div>

        <div className="grid gap-8 auto-rows-min">
          <DashboardCircleChart
            linearTasksWithTime={linearTasksWithTogglTimePercentage}
            className="bg-[#1A1F26] p-4 rounded-sm flex items-center max-h-fit"
          ></DashboardCircleChart>
          <DashboardCard className="rounded-sm"></DashboardCard>
        </div>
      </div>
    </div>
  );
}
