import { CalendarIcon, MapPinIcon, UsersIcon } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { JoinConfirmButton } from "@/components/join-confirm-button";
import { createClient } from "@/lib/supabase/server";
import { getEventByInviteCode } from "@/lib/api/events";
import { getMyParticipation } from "@/lib/api/participants";

export default async function JoinPage({ params }: { params: Promise<{ invite_code: string }> }) {
  const { invite_code } = await params;
  const supabase = await createClient();
  const event = await getEventByInviteCode(supabase, invite_code);

  if (!event) {
    return (
      <div className="p-5">
        <EmptyState title="유효하지 않은 초대 링크입니다" description="링크를 다시 확인해주세요." />
      </div>
    );
  }

  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims.sub;
  const alreadyJoined = userId
    ? Boolean(await getMyParticipation(supabase, event.id, userId))
    : false;

  const formattedDate = new Date(event.eventDate).toLocaleString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <div className="space-y-6 p-5">
      <div className="space-y-1 text-center">
        <p className="text-muted-foreground text-sm">초대받은 이벤트</p>
        <h1 className="text-2xl font-bold">{event.title}</h1>
      </div>

      <div className="bg-muted aspect-video w-full rounded-xl" />

      {event.description && <p className="text-muted-foreground text-sm">{event.description}</p>}

      <div className="bg-card text-muted-foreground space-y-2 rounded-lg border p-4 text-sm">
        <div className="flex items-center gap-2">
          <CalendarIcon className="size-4 shrink-0" />
          <span>{formattedDate}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPinIcon className="size-4 shrink-0" />
          <span>{event.location}</span>
        </div>
        <div className="flex items-center gap-2">
          <UsersIcon className="size-4 shrink-0" />
          <span>참여자 {event.participantCount}명</span>
        </div>
      </div>

      <JoinConfirmButton
        eventId={event.id}
        eventTitle={event.title}
        alreadyJoined={alreadyJoined}
      />
    </div>
  );
}
