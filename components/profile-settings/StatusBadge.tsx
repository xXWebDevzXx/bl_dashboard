interface StatusBadgeProps {
  verified: boolean;
}

export function StatusBadge({ verified }: StatusBadgeProps) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-normal/10 border border-emerald-normal/20">
      <div className="w-2 h-2 rounded-full bg-emerald-normal animate-pulse" />
      <span className="text-emerald-light text-xs font-medium">
        {verified ? "Verified Account" : "Pending Verification"}
      </span>
    </div>
  );
}

