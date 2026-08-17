import type { Database } from "@/lib/supabase/database.types";
import type { User, UserRole, PublicProfile } from "@/lib/types/user";
import type { Event, EventStatus } from "@/lib/types/event";
import type { EventParticipant, ParticipantRole } from "@/lib/types/participant";

/**
 * DB row(snake_case) → 기존 UI 타입(camelCase) 변환 레이어.
 * 실제 Supabase 클라이언트 호출은 포함하지 않으며, 순수 변환 함수만 둔다.
 */

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type EventRow = Database["public"]["Tables"]["events"]["Row"];
type EventParticipantRow = Database["public"]["Tables"]["event_participants"]["Row"];

/** profiles row → 공개 프로필(PublicProfile) 변환 */
export function toPublicProfile(row: ProfileRow): PublicProfile {
  return {
    id: row.id,
    name: row.full_name ?? row.username ?? "이름 없음",
    avatarUrl: row.avatar_url,
  };
}

/** profiles row → User 변환 */
export function toUser(row: ProfileRow): User {
  return {
    id: row.id,
    email: row.email,
    name: row.full_name ?? row.username ?? "이름 없음",
    avatarUrl: row.avatar_url,
    role: row.role as UserRole,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * events row → Event 변환.
 * participantCount는 DB row에 없는 집계값이므로 호출 측에서 전달한다.
 * 실제 집계는 Task 009/010에서 연결 예정.
 */
export function toEvent(row: EventRow, participantCount = 0): Event {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    location: row.location,
    eventDate: row.event_date,
    coverImageUrl: row.cover_image_url,
    inviteCode: row.invite_code,
    status: row.status as EventStatus,
    createdBy: row.created_by,
    participantCount,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** event_participants row + profiles row → EventParticipant 변환 */
export function toEventParticipant(
  row: EventParticipantRow,
  profileRow: ProfileRow,
): EventParticipant {
  return {
    id: row.id,
    eventId: row.event_id,
    userId: row.user_id,
    role: row.role as ParticipantRole,
    joinedAt: row.joined_at,
    user: toPublicProfile(profileRow),
  };
}
