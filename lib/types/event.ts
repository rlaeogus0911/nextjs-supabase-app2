import type { EventParticipant } from "./participant";

/**
 * 임시 타입 - Task 007에서 실제 DB 스키마 타입(generate_typescript_types 생성물)으로 교체 예정
 */

export type EventStatus = "upcoming" | "ongoing" | "ended";

export interface Event {
  id: string;
  title: string;
  description: string | null;
  location: string;
  eventDate: string;
  coverImageUrl: string | null;
  inviteCode: string;
  status: EventStatus;
  createdBy: string;
  participantCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface EventWithParticipants extends Event {
  participants: EventParticipant[];
}

export interface CreateEventInput {
  title: string;
  description?: string;
  location: string;
  eventDate: string;
  coverImageUrl?: string;
}

export type UpdateEventInput = Partial<CreateEventInput>;
