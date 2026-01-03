import DashboardAreaChart from "@/components/dashboard/DashboardAreaChart";
import BoxPlotCard from "@/components/dashboard/BoxPlotCard";
import DashboardCard from "@/components/dashboard/DashboardCard";
import DashboardCircleChart from "@/components/dashboard/DashboardCircleChart";
import DashboardClientWrapper from "@/components/dashboard/DashboardClientWrapper";
import DashboardRadialChart from "@/components/dashboard/DashboardRadialChart";
import EstimationAccuracyChart from "@/components/dashboard/EstimationAccuracyChart";
import ReportExportButton from "@/components/dashboard/ReportExportButton";
import { auth0 } from "@/lib/auth0";
import { getDashboardStats } from "@/lib/dashboard-stats";
import { ensureUserSynced } from "@/lib/ensure-user-synced";
import { getTimeChartData } from "@/lib/time-chart-data";
import { SquareCheckBig } from "lucide-react";
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
    linearTasksWithTogglTimeCount,
    averageTogglTimeHours,
    linearTasksWithDelegatePercentage,
  } = await getDashboardStats();

  // Fetch time chart data for the mini line charts
  const timeChartData = await getTimeChartData();

  // Calculate total hours and prepare trend data (last 30 days)
  const last30Days = timeChartData.slice(-30);

  // Prepare mini chart data (simplified)
  const totalHoursChartData = last30Days.map((day) => ({
    value: day.aiTasksHours + day.nonAiTasksHours,
  }));

  return (
    <DashboardClientWrapper>
      <div className="p-4 sm:p-6 desktop:p-8">
        <div className="flex justify-end mb-4 sm:mb-6 desktop:mb-8">
          <ReportExportButton />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 desktop:grid-cols-4 gap-4 sm:gap-6 desktop:gap-8 mb-4 sm:mb-6 desktop:mb-8">
          <DashboardCard
            className="rounded-sm"
            bigText={`${linearTasksCount}`}
            unit={
              <SquareCheckBig className="inline-block mb-[5.6px]" size={25} />
            }
            smallText="issues last year"
          ></DashboardCard>
          <DashboardCard
            className="rounded-sm"
            bigText={`${linearTasksWithTogglTimePercentage.toFixed(2)}`}
            unit="%"
            smallText="issues with time tracked"
          ></DashboardCard>
          <DashboardCard
            className="rounded-sm"
            bigText={`${averageTogglTimeHours.toFixed(2)}`}
            unit="hrs"
            smallText="average time per entry"
            chartData={totalHoursChartData}
            lineColor="#4876DE"
            showChart={true}
          />
          <DashboardCard
            className="rounded-sm"
            bigText={`${linearTasksWithDelegatePercentage.toFixed(2)}`}
            unit="%"
            smallText="AI-assisted issues"
          ></DashboardCard>
        </div>
        <div className="grid grid-cols-1 desktop:grid-cols-2 gap-4 sm:gap-6 desktop:gap-8">
          <div className="grid gap-4 sm:gap-6 desktop:gap-8 auto-rows-min">
            <DashboardAreaChart className="bg-card h-fit border border-border-zinc/60 p-2 sm:p-4 rounded-sm shadow-xl shadow-black/25 animate-[fadeInScale_0.6s_ease-out_0.2s_both] overflow-hidden"></DashboardAreaChart>
            <EstimationAccuracyChart className="h-fit" />
          </div>

          <div className="grid gap-4 sm:gap-6 desktop:gap-8 auto-rows-min">
            <DashboardCircleChart
              linearTasksWithTime={linearTasksWithTogglTimePercentage}
              trackedCount={linearTasksWithTogglTimeCount}
              totalCount={linearTasksCount}
              className="bg-card border border-border-zinc/60 p-2 sm:p-4 rounded-sm flex items-center max-h-fit shadow-xl shadow-black/25 animate-[fadeInScale_0.6s_ease-out_0.3s_both] overflow-hidden"
            ></DashboardCircleChart>
            <DashboardRadialChart />
          </div>
        </div>
        <div className="mt-4 sm:mt-6 desktop:mt-8">
          <BoxPlotCard className="h-fit" />
        </div>
      </div>
    </DashboardClientWrapper>
  );
}
