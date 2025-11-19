import DashboardAreaChart from "@/components/dashboard/DashboardAreaChart";
import DashboardCard from "@/components/dashboard/DashboardCard";
import DashboardCircleChart from "@/components/dashboard/DashboardCircleChart";

export default function Home() {
  return (
    <div className="p-8">
      <div className="grid grid-cols-4 gap-8 mb-8">
        <DashboardCard className="rounded-sm" bigText="152.3 hrs" smallText="Sidste 30 dage"></DashboardCard>
        <DashboardCard className="rounded-sm" bigText="+18%" smallText="AI tasks vs non-AI tasks"></DashboardCard>
        <DashboardCard className="rounded-sm" bigText="1.9 hrs" smallText="-12% fra sidste måned"></DashboardCard>
        <DashboardCard className="rounded-sm" bigText="+34%" smallText="AI-assisteret opgaver"></DashboardCard>
      </div>
<div className="grid grid-cols-2 gap-8">
  
        <div className="grid gap-8 auto-rows-auto mb-8">
          <DashboardAreaChart className="bg-[#1A1F26] p-4 rounded-sm"></DashboardAreaChart>
          <DashboardCard className="rounded-sm"></DashboardCard>
        </div>
  
        <div className="grid gap-8 auto-rows-min">
          <DashboardCircleChart className="bg-[#1A1F26] p-4 rounded-sm flex items-center max-h-fit"></DashboardCircleChart>
          <DashboardCard className="rounded-sm"></DashboardCard>
        </div>
</div>
    </div>
  );
}
