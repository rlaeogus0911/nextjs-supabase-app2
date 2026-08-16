import { LoadingSkeleton } from "@/components/loading-skeleton";

export default function EventsLoading() {
  return (
    <div className="space-y-5 p-5">
      <h1 className="text-2xl font-bold">내 이벤트</h1>
      <LoadingSkeleton variant="card" count={3} />
    </div>
  );
}
