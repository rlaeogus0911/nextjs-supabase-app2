import { CalendarIcon, MapPinIcon, UsersIcon } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { JoinConfirmButton } from "@/components/join-confirm-button";
import { getMockEvents } from "@/lib/mock";

export default async function JoinPage({ params }: { params: Promise<{ invite_code: string }> }) {
  const { invite_code } = await params;
  const event = getMockEvents().find((e) => e.inviteCode === invite_code);

  if (!event) {
    return (
      <div className="p-5">
        <EmptyState title="유효하지 않은 초대 링크입니다" description="링크를 다시 확인해주세요." />
      </div>
    );
  }

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
        <p className="text-sm text-muted-foreground">초대받은 이벤트</p>
        <h1 className="text-2xl font-bold">{event.title}</h1>
      </div>

      <div className="aspect-video w-full rounded-xl bg-muted" />

      {event.description && <p className="text-sm text-muted-foreground">{event.description}</p>}

      <div className="space-y-2 rounded-lg border bg-card p-4 text-sm text-muted-foreground">
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

      <JoinConfirmButton eventId={event.id} eventTitle={event.title} />
    </div>
  );
}
