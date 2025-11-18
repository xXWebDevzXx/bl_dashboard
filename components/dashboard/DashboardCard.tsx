import { cn } from "@/lib/utils";

function DashboardCard({ className, bigText, smallText }: { className?: string, bigText?: string, smallText?: string }) {
  return <div className={cn("bg-[#1A1F26] p-8 h-fit text-white", className)}>
    <h1 className="text-5xl font-bold">{bigText}</h1>
    <p>{smallText}</p>
  </div>;
}

export default DashboardCard;
