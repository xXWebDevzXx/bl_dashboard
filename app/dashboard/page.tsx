import DashboardCard from "@/components/dashboard/DashboardCard";


export default function Home() {
  return (
    <div className="grid grid-cols-4 p-8 gap-8">
      <DashboardCard bigText="152.3 hrs" smallText="Sidste 30 dage"></DashboardCard>
      <DashboardCard bigText="+18%" smallText="AI tasks vs non-AI tasks"></DashboardCard>
      <DashboardCard bigText="1.9 hrs" smallText="-12% fra sidste måned"></DashboardCard>
      <DashboardCard bigText="+34%" smallText="AI-assisteret opgaver"></DashboardCard>
      <DashboardCard className="col-span-2"></DashboardCard>
      <DashboardCard className="col-span-2"></DashboardCard>
      <DashboardCard className="col-span-2"></DashboardCard>
      <DashboardCard className="col-span-2"></DashboardCard>
    </div>
  );
}
