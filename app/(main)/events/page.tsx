import Link from "next/link";
import { PlusIcon } from "lucide-react";

import { EventStatusFilter } from "@/components/event-status-filter";
import { Button } from "@/components/ui/button";
import { getMockMyEvents } from "@/lib/mock";

export default function EventsPage() {
  const myEvents = getMockMyEvents();

  return (
    <div className="space-y-5 p-5">
      <h1 className="text-2xl font-bold">내 이벤트</h1>

      <EventStatusFilter items={myEvents} />

      <Button
        asChild
        size="icon"
        className="absolute bottom-20 right-5 z-40 size-14 rounded-full shadow-lg"
      >
        <Link href="/events/new" aria-label="새 이벤트 만들기">
          <PlusIcon className="size-6" />
        </Link>
      </Button>
    </div>
  );
}
