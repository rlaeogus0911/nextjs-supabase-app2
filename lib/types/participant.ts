import type { PublicProfile } from "./user";

/**
 * 임시 타입 - Task 007에서 실제 DB 스키마 타입(generate_typescript_types 생성물)으로 교체 예정
 */

export type ParticipantRole = "host" | "participant";

export interface EventParticipant {
  id: string;
  eventId: string;
  userId: string;
  role: ParticipantRole;
  joinedAt: string;
  user: PublicProfile;
}
