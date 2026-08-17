"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

interface ParticipantCountRealtimeProps {
  eventId: string;
  initialCount: number;
}

export function ParticipantCountRealtime({ eventId, initialCount }: ParticipantCountRealtimeProps) {
  const router = useRouter();
  const [count, setCount] = useState(initialCount);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`event_participants_${eventId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "event_participants",
          filter: `event_id=eq.${eventId}`,
        },
        () => {
          setCount((c) => c + 1);
          router.refresh();
        },
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "event_participants",
          filter: `event_id=eq.${eventId}`,
        },
        () => {
          setCount((c) => Math.max(0, c - 1));
          router.refresh();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId, router]);

  return <>{count}</>;
}
