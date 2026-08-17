import Link from "next/link";
import { CalendarIcon, MapPinIcon, UsersIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { EventCardProps } from "@/lib/types/components";
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

export function EventCard({ event, href, role }: EventCardProps) {
  const formattedDate = new Date(event.eventDate).toLocaleString("ko-KR", {
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <Link href={href}>
      <Card className="hover:bg-accent/50 overflow-hidden transition-colors">
        <div className="bg-muted aspect-video w-full overflow-hidden">
          {event.coverImageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={event.coverImageUrl}
              alt={`${event.title} 커버 이미지`}
              className="size-full object-cover"
            />
          )}
        </div>
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="line-clamp-1">{event.title}</CardTitle>
            <div className="flex shrink-0 items-center gap-1">
              {role === "host" && <Badge variant="secondary">주최자</Badge>}
              {role === "participant" && <Badge variant="outline">참여자</Badge>}
              <Badge variant={STATUS_VARIANT[event.status]}>{STATUS_LABEL[event.status]}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="text-muted-foreground space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <CalendarIcon className="size-4 shrink-0" />
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPinIcon className="size-4 shrink-0" />
            <span className="line-clamp-1">{event.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <UsersIcon className="size-4 shrink-0" />
            <span>참여자 {event.participantCount}명</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
