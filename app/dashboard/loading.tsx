import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="p-4 sm:p-6 desktop:p-8">
      {/* Export button area */}
      <div className="flex justify-end mb-4 sm:mb-6 desktop:mb-8">
        <Skeleton className="h-10 w-32 rounded-sm" />
      </div>

      {/* Stats cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 desktop:grid-cols-4 gap-4 sm:gap-6 desktop:gap-8 mb-4 sm:mb-6 desktop:mb-8">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-sm" />
        ))}
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 desktop:grid-cols-2 gap-4 sm:gap-6 desktop:gap-8">
        {/* Left column */}
        <div className="grid gap-4 sm:gap-6 desktop:gap-8 auto-rows-min">
          <Skeleton className="h-80 rounded-sm" />
          <Skeleton className="h-72 rounded-sm" />
          <Skeleton className="h-96 rounded-sm" />
        </div>

        {/* Right column */}
        <div className="grid gap-4 sm:gap-6 desktop:gap-8 auto-rows-min">
          <Skeleton className="h-64 rounded-sm" />
          <Skeleton className="h-80 rounded-sm" />
        </div>
      </div>
    </div>
  );
}
