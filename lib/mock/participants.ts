import type { EventParticipant } from "@/lib/types/participant";
import { getMockEvents } from "@/lib/mock/events";
import { getMockUsers } from "@/lib/mock/users";

const NOW = new Date("2026-08-16T09:00:00.000Z").toISOString();

export function getMockParticipants(): EventParticipant[] {
  const events = getMockEvents();
  const users = getMockUsers();

  const toProfile = (userId: string) => {
    const user = users.find((u) => u.id === userId)!;
    return { id: user.id, name: user.name, avatarUrl: user.avatarUrl };
  };

  return [
    {
      id: "participant-1",
      eventId: events[0].id,
      userId: users[0].id,
      role: "host",
      joinedAt: NOW,
      user: toProfile(users[0].id),
    },
    {
      id: "participant-2",
      eventId: events[0].id,
      userId: users[1].id,
      role: "participant",
      joinedAt: NOW,
      user: toProfile(users[1].id),
    },
    {
      id: "participant-3",
      eventId: events[0].id,
      userId: users[2].id,
      role: "participant",
      joinedAt: NOW,
      user: toProfile(users[2].id),
    },
    {
      id: "participant-4",
      eventId: events[1].id,
      userId: users[1].id,
      role: "host",
      joinedAt: NOW,
      user: toProfile(users[1].id),
    },
    {
      id: "participant-5",
      eventId: events[1].id,
      userId: users[3].id,
      role: "participant",
      joinedAt: NOW,
      user: toProfile(users[3].id),
    },
    {
      id: "participant-6",
      eventId: events[1].id,
      userId: users[4].id,
      role: "participant",
      joinedAt: NOW,
      user: toProfile(users[4].id),
    },
    // user-1(김하은)을 다른 이벤트의 "참여자"로도 등록 — 참여자 뷰 데모용
    {
      id: "participant-7",
      eventId: events[1].id,
      userId: users[0].id,
      role: "participant",
      joinedAt: NOW,
      user: toProfile(users[0].id),
    },
    {
      id: "participant-8",
      eventId: events[4].id,
      userId: users[0].id,
      role: "participant",
      joinedAt: NOW,
      user: toProfile(users[0].id),
    },
  ];
}

export function getMockParticipantsByEventId(eventId: string): EventParticipant[] {
  return getMockParticipants().filter((p) => p.eventId === eventId);
}

export function getMockMyParticipation(
  eventId: string,
  userId: string,
): EventParticipant | undefined {
  return getMockParticipantsByEventId(eventId).find((p) => p.userId === userId);
}
