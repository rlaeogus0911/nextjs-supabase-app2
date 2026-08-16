import type { Event } from "@/lib/types/event";
import type { ParticipantRole } from "@/lib/types/participant";
import { getMockEvents } from "./events";
import { getMockParticipants } from "./participants";
import { MOCK_CURRENT_USER_ID } from "./users";

export interface MyEvent {
  event: Event;
  role: ParticipantRole;
}

/** 현재 로그인한 목업 사용자가 주최자 또는 참여자로 속한 이벤트 목록 (F007) */
export function getMockMyEvents(): MyEvent[] {
  const events = getMockEvents();
  const myParticipations = getMockParticipants().filter((p) => p.userId === MOCK_CURRENT_USER_ID);

  return myParticipations
    .map((participation) => {
      const event = events.find((e) => e.id === participation.eventId);
      return event ? { event, role: participation.role } : null;
    })
    .filter((entry): entry is MyEvent => entry !== null);
}
