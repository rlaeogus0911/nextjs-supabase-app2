import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/database.types";
import { toEventParticipant } from "@/lib/mappers";
import type { EventParticipant } from "@/lib/types/participant";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type EventParticipantRow = Database["public"]["Tables"]["event_participants"]["Row"];

/** 이미 참여 중인 이벤트인지 확인한다. */
export async function getMyParticipation(
  supabase: SupabaseClient<Database>,
  eventId: string,
  userId: string,
): Promise<EventParticipant | null> {
  const { data, error } = await supabase
    .from("event_participants")
    .select("*, profiles(*)")
    .eq("event_id", eventId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(`참여 여부 확인에 실패했습니다: ${error.message}`);
  }

  if (!data || !data.profiles) return null;

  return toEventParticipant(
    data as unknown as EventParticipantRow,
    (data as unknown as { profiles: ProfileRow }).profiles,
  );
}

/** 이벤트에 참여자로 등록한다. (F004, 중복 참여 방지) */
export async function joinEvent(
  supabase: SupabaseClient<Database>,
  eventId: string,
  userId: string,
): Promise<void> {
  const { error } = await supabase.from("event_participants").insert({
    event_id: eventId,
    user_id: userId,
  });

  if (error) {
    if (error.code === "23505") {
      throw new Error("이미 참여한 이벤트입니다.");
    }
    throw new Error(`이벤트 참여에 실패했습니다: ${error.message}`);
  }
}
