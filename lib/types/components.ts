import type { Event } from "./event";
import type { EventParticipant, ParticipantRole } from "./participant";

export interface EventCardProps {
  event: Event;
  href: string;
  role?: ParticipantRole;
}

export interface ParticipantCardProps {
  participant: EventParticipant;
}

export interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export interface LoadingSkeletonProps {
  count?: number;
  variant?: "card" | "row";
}
