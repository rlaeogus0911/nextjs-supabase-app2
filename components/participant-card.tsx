import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { ParticipantCardProps } from "@/lib/types/components";

export function ParticipantCard({ participant }: ParticipantCardProps) {
  const initial = participant.user.name.slice(0, 1);

  return (
    <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
      <Avatar>
        {participant.user.avatarUrl && (
          <AvatarImage src={participant.user.avatarUrl} alt={participant.user.name} />
        )}
        <AvatarFallback>{initial}</AvatarFallback>
      </Avatar>
      <span className="flex-1 truncate font-medium">{participant.user.name}</span>
      {participant.role === "host" && <Badge variant="secondary">주최자</Badge>}
    </div>
  );
}
