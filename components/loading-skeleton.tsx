import { Skeleton } from "@/components/ui/skeleton";
import type { LoadingSkeletonProps } from "@/lib/types/components";

function CardSkeleton() {
  return (
    <div className="space-y-3 rounded-xl border p-4">
      <Skeleton className="aspect-video w-full" />
      <Skeleton className="h-5 w-2/3" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-4 w-1/3" />
    </div>
  );
}

function RowSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-lg border p-3">
      <Skeleton className="size-8 rounded-full" />
      <Skeleton className="h-4 flex-1" />
    </div>
  );
}

export function LoadingSkeleton({ count = 3, variant = "card" }: LoadingSkeletonProps) {
  const items = Array.from({ length: count });

  if (variant === "row") {
    return (
      <div className="space-y-2">
        {items.map((_, index) => (
          <RowSkeleton key={index} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((_, index) => (
        <CardSkeleton key={index} />
      ))}
    </div>
  );
}
