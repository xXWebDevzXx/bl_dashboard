import { Skeleton } from "@/components/ui/skeleton";

export default function IssuesLoading() {
  return (
    <div className="p-4 sm:p-6 desktop:p-8">
      {/* Header */}
      <div className="flex items-baseline gap-3 mb-4 sm:mb-6 desktop:mb-8">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-6 w-12" />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Results card */}
      <div className="bg-card border border-border-zinc/60 rounded-sm shadow-xl shadow-black/25">
        <div className="p-4 sm:p-6 border-b border-border-zinc/60">
          <Skeleton className="h-6 w-20" />
        </div>
        <div className="p-4 sm:p-6">
          {/* Issue cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 desktop:grid-cols-3 gap-4 sm:gap-6">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="bg-card-foreground border border-border-zinc/60 rounded-sm p-4 sm:p-5">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-5 w-12" />
                </div>
                <Skeleton className="h-5 w-full mb-1" />
                <Skeleton className="h-5 w-3/4 mb-4" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center mt-6 sm:mt-8 gap-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-10" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
