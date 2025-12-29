import { LucideIcon } from "lucide-react";

interface InfoItemProps {
  icon: LucideIcon;
  label: string;
  value: string;
  iconColor: string;
  iconBgColor: string;
}

export function InfoItem({
  icon: Icon,
  label,
  value,
  iconColor,
  iconBgColor,
}: InfoItemProps) {
  return (
    <div className="p-4 rounded-lg bg-zinc-900/50 border border-border-zinc/40 hover:border-border-zinc/60 transition-colors">
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-2 rounded-md ${iconBgColor}`}>
          <Icon className={`w-4 h-4 ${iconColor}`} />
        </div>
        <span className="text-xs text-zinc-500 uppercase tracking-wide font-medium">
          {label}
        </span>
      </div>
      <p className="text-white font-medium pl-11">{value}</p>
    </div>
  );
}

