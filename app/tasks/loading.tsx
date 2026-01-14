import { Skeleton } from "@/components/ui/skeleton";

export default function TasksLoading() {
  return (
    <div className="bg-card border border-border-zinc/60 rounded-sm">
      {/* Header */}
      <div className="p-6 border-b border-border-zinc/60">
        <Skeleton className="h-6 w-24" />
      </div>

      {/* Task cards list */}
      <div className="p-6 space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-card-foreground border border-border-zinc/60 rounded-sm p-4">
            <Skeleton className="h-5 w-3/4 mb-3" />
            <Skeleton className="h-4 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
