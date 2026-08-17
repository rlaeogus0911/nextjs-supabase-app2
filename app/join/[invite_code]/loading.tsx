import { Skeleton } from "@/components/ui/skeleton";

export default function JoinLoading() {
  return (
    <div className="space-y-6 p-5">
      <div className="space-y-2 text-center">
        <Skeleton className="mx-auto h-4 w-24" />
        <Skeleton className="mx-auto h-7 w-2/3" />
      </div>

      <Skeleton className="aspect-video w-full rounded-xl" />

      <div className="bg-card space-y-2 rounded-lg border p-4">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-4 w-1/4" />
      </div>

      <Skeleton className="h-11 w-full rounded-md" />
    </div>
  );
}
