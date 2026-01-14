import { Skeleton } from "@/components/ui/skeleton";

export default function IssueDetailLoading() {
  return (
    <div className="p-8">
      {/* Back link */}
      <Skeleton className="h-5 w-28 mb-6" />

      {/* Main info card */}
      <div className="bg-card border border-border-zinc/60 rounded-sm p-6 mb-6">
        <Skeleton className="h-4 w-20 mb-2" />
        <Skeleton className="h-9 w-3/4 mb-4" />

        {/* Labels */}
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>

        {/* Delegate */}
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-48" />
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-40" />
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-card border border-border-zinc/60 rounded-sm p-6">
            <div className="flex items-center gap-2 mb-2">
              <Skeleton className="h-5 w-5" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-9 w-20" />
          </div>
        ))}
      </div>

      {/* Time entries card */}
      <div className="bg-card border border-border-zinc/60 rounded-sm p-6">
        <Skeleton className="h-6 w-32 mb-4" />
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-card-foreground p-4 rounded border border-gray-800">
              <div className="flex justify-between items-start mb-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-5 w-16" />
              </div>
              <div className="flex gap-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
