import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/database.types";
import { toEvent, toEventParticipant } from "@/lib/mappers";
import { generateInviteCode } from "@/lib/utils/invite-code";
import type { CreateEventInput, Event, UpdateEventInput } from "@/lib/types/event";
import type { EventParticipant, ParticipantRole } from "@/lib/types/participant";

type EventRow = Database["public"]["Tables"]["events"]["Row"];
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type EventParticipantRow = Database["public"]["Tables"]["event_participants"]["Row"];

// events(...) select 시 event_participants(count) 관계 집계로 N+1 회피
const EVENT_SELECT_WITH_COUNT = "*, event_participants(count)";

type EventRowWithCount = EventRow & {
  event_participants: { count: number }[];
};

function toEventFromRowWithCount(row: EventRowWithCount): Event {
  const participantCount = row.event_participants?.[0]?.count ?? 0;
  return toEvent(row, participantCount);
}

/** 현재 사용자가 주최자이거나 참여 중인 이벤트 목록을 role과 함께 조회한다. (F007/F008) */
export async function getEvents(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<{ event: Event; role: ParticipantRole }[]> {
  const { data: participations, error: participationError } = await supabase
    .from("event_participants")
    .select("event_id, role")
    .eq("user_id", userId);

  if (participationError) {
    throw new Error(`참여 이벤트 조회에 실패했습니다: ${participationError.message}`);
  }

  const roleByEventId = new Map<string, ParticipantRole>(
    (participations ?? []).map((p) => [p.event_id, p.role as ParticipantRole]),
  );
  const eventIds = Array.from(roleByEventId.keys());

  if (eventIds.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from("events")
    .select(EVENT_SELECT_WITH_COUNT)
    .in("id", eventIds)
    .order("event_date", { ascending: true });

  if (error) {
    throw new Error(`이벤트 목록 조회에 실패했습니다: ${error.message}`);
  }

  return ((data ?? []) as unknown as EventRowWithCount[]).map((row) => ({
    event: toEventFromRowWithCount(row),
    role: roleByEventId.get(row.id) ?? "participant",
  }));
}

/** 초대 코드로 이벤트를 조회한다. (F004) */
export async function getEventByInviteCode(
  supabase: SupabaseClient<Database>,
  inviteCode: string,
): Promise<Event | null> {
  const { data, error } = await supabase
    .from("events")
    .select(EVENT_SELECT_WITH_COUNT)
    .eq("invite_code", inviteCode)
    .maybeSingle();

  if (error) {
    throw new Error(`초대 코드로 이벤트 조회에 실패했습니다: ${error.message}`);
  }

  if (!data) return null;

  return toEventFromRowWithCount(data as unknown as EventRowWithCount);
}

/** 이벤트 단건을 조회한다. */
export async function getEventById(
  supabase: SupabaseClient<Database>,
  eventId: string,
): Promise<Event | null> {
  const { data, error } = await supabase
    .from("events")
    .select(EVENT_SELECT_WITH_COUNT)
    .eq("id", eventId)
    .maybeSingle();

  if (error) {
    throw new Error(`이벤트 조회에 실패했습니다: ${error.message}`);
  }

  if (!data) return null;

  return toEventFromRowWithCount(data as unknown as EventRowWithCount);
}

/** 이벤트를 생성하고 생성자를 host로 event_participants에 함께 등록한다. */
export async function createEvent(
  supabase: SupabaseClient<Database>,
  userId: string,
  input: CreateEventInput,
): Promise<Event> {
  const { data, error } = await supabase
    .from("events")
    .insert({
      title: input.title,
      description: input.description ?? null,
      location: input.location,
      event_date: input.eventDate,
      cover_image_url: input.coverImageUrl ?? null,
      invite_code: generateInviteCode(),
      created_by: userId,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`이벤트 생성에 실패했습니다: ${error.message}`);
  }

  const { error: participantError } = await supabase.from("event_participants").insert({
    event_id: data.id,
    user_id: userId,
    role: "host",
  });

  if (participantError) {
    throw new Error(`이벤트 주최자 등록에 실패했습니다: ${participantError.message}`);
  }

  return toEvent(data, 1);
}

/** 이벤트를 수정한다. */
export async function updateEvent(
  supabase: SupabaseClient<Database>,
  eventId: string,
  input: UpdateEventInput,
): Promise<Event> {
  const updatePayload: Database["public"]["Tables"]["events"]["Update"] = {};

  if (input.title !== undefined) updatePayload.title = input.title;
  if (input.description !== undefined) updatePayload.description = input.description ?? null;
  if (input.location !== undefined) updatePayload.location = input.location;
  if (input.eventDate !== undefined) updatePayload.event_date = input.eventDate;
  if (input.coverImageUrl !== undefined)
    updatePayload.cover_image_url = input.coverImageUrl ?? null;

  const { data, error } = await supabase
    .from("events")
    .update(updatePayload)
    .eq("id", eventId)
    .select()
    .single();

  if (error) {
    throw new Error(`이벤트 수정에 실패했습니다: ${error.message}`);
  }

  return toEvent(data);
}

/** 이벤트를 삭제한다. (event_participants는 FK cascade 또는 RLS에 위임) */
export async function deleteEvent(
  supabase: SupabaseClient<Database>,
  eventId: string,
): Promise<void> {
  const { error } = await supabase.from("events").delete().eq("id", eventId);

  if (error) {
    throw new Error(`이벤트 삭제에 실패했습니다: ${error.message}`);
  }
}

/** 이벤트의 참여자 목록을 profiles와 조인해 조회한다. */
export async function getEventParticipants(
  supabase: SupabaseClient<Database>,
  eventId: string,
): Promise<EventParticipant[]> {
  const { data, error } = await supabase
    .from("event_participants")
    .select("*, profiles(*)")
    .eq("event_id", eventId)
    .order("joined_at", { ascending: true });

  if (error) {
    throw new Error(`참여자 목록 조회에 실패했습니다: ${error.message}`);
  }

  return ((data ?? []) as unknown as (EventParticipantRow & { profiles: ProfileRow })[])
    .filter((row) => row.profiles)
    .map((row) => toEventParticipant(row, row.profiles));
}
