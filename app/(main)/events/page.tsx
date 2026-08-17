import Link from "next/link";
import { PlusIcon } from "lucide-react";

import { EventStatusFilter } from "@/components/event-status-filter";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { getEvents } from "@/lib/api/events";
import { computeEventStatus } from "@/lib/utils/event-status";
import type { MyEvent } from "@/lib/mock";

export default async function EventsPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims.sub;

  const events = userId ? await getEvents(supabase, userId) : [];

  const myEvents: MyEvent[] = events.map((event) => ({
    event: { ...event, status: computeEventStatus(event.eventDate) },
    role: userId && event.createdBy === userId ? "host" : "participant",
  }));

  return (
    <div className="space-y-5 p-5">
      <h1 className="text-2xl font-bold">내 이벤트</h1>

      <EventStatusFilter items={myEvents} />

      <Button
        asChild
        size="icon"
        className="absolute right-5 bottom-20 z-40 size-14 rounded-full shadow-lg"
      >
        <Link href="/events/new" aria-label="새 이벤트 만들기">
          <PlusIcon className="size-6" />
        </Link>
      </Button>
    </div>
  );
}
