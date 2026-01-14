import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileLoading() {
  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Skeleton className="h-9 w-48 mb-2" />
          <Skeleton className="h-5 w-80" />
        </div>

        {/* Profile content */}
        <div className="space-y-6">
          {/* Avatar and basic info card */}
          <div className="bg-card border border-border-zinc/60 rounded-sm p-6">
            <div className="flex items-center gap-6">
              <Skeleton className="h-20 w-20 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64" />
              </div>
            </div>
          </div>

          {/* Settings sections */}
          <div className="bg-card border border-border-zinc/60 rounded-sm p-6 space-y-4">
            <Skeleton className="h-6 w-32 mb-4" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>

          {/* Danger zone */}
          <div className="bg-card border border-red-900/30 rounded-sm p-6">
            <Skeleton className="h-6 w-28 mb-4" />
            <Skeleton className="h-10 w-40" />
          </div>
        </div>
      </div>
    </div>
  );
}
