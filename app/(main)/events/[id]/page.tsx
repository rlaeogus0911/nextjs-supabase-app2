import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarIcon, MapPinIcon, PencilIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { EventDeleteDialog } from "@/components/event-delete-dialog";
import { EventInviteLink } from "@/components/event-invite-link";
import { ParticipantCard } from "@/components/participant-card";
import { createClient } from "@/lib/supabase/server";
import { getEventById, getEventParticipants } from "@/lib/api/events";
import { computeEventStatus } from "@/lib/utils/event-status";
import type { EventStatus } from "@/lib/types/event";

const STATUS_LABEL: Record<EventStatus, string> = {
  upcoming: "예정",
  ongoing: "진행중",
  ended: "종료",
};

const STATUS_VARIANT: Record<EventStatus, "default" | "secondary" | "outline"> = {
  upcoming: "default",
  ongoing: "secondary",
  ended: "outline",
};

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const currentUserId = data?.claims.sub;

  const event = await getEventById(supabase, id);

  if (!event) {
    notFound();
  }

  const status = computeEventStatus(event.eventDate);
  const participants = await getEventParticipants(supabase, event.id);
  const isHost = currentUserId === event.createdBy;
  const formattedDate = new Date(event.eventDate).toLocaleString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <div className="space-y-6 p-5">
      <div className="bg-muted aspect-video w-full overflow-hidden rounded-xl">
        {event.coverImageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={event.coverImageUrl}
            alt={`${event.title} 커버 이미지`}
            className="size-full object-cover"
          />
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h1 className="text-2xl font-bold">{event.title}</h1>
          <Badge variant={STATUS_VARIANT[status]}>{STATUS_LABEL[status]}</Badge>
        </div>
        {event.description && <p className="text-muted-foreground text-sm">{event.description}</p>}
        <div className="text-muted-foreground space-y-1 text-sm">
          <div className="flex items-center gap-2">
            <CalendarIcon className="size-4 shrink-0" />
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPinIcon className="size-4 shrink-0" />
            <span>{event.location}</span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-lg font-semibold">초대 링크</h2>
        <EventInviteLink inviteCode={event.inviteCode} shareOnly={!isHost} />
      </div>

      <div className="space-y-2">
        <h2 className="text-lg font-semibold">참여자 {participants.length}명</h2>
        {participants.length === 0 ? (
          <EmptyState title="아직 참여자가 없습니다" description="초대 링크를 공유해보세요." />
        ) : (
          <div className="space-y-2">
            {participants.map((participant) => (
              <ParticipantCard key={participant.id} participant={participant} />
            ))}
          </div>
        )}
      </div>

      {isHost ? (
        <div className="flex gap-2">
          <Button asChild variant="outline" className="flex-1">
            <Link href={`/events/${event.id}/edit`}>
              <PencilIcon className="size-4" />
              이벤트 수정
            </Link>
          </Button>
          <EventDeleteDialog eventId={event.id} eventTitle={event.title} />
        </div>
      ) : (
        <Badge variant="outline" className="w-fit">
          참여자로 참여 중
        </Badge>
      )}
    </div>
  );
}
