import type { EventStatus } from "@/lib/types/event";

/**
 * event_date 기준으로 이벤트 상태를 read-time에 파생 계산한다. (F008)
 * DB의 status 컬럼은 생성 시 초기값만 저장하고, 실제 표시 시점에는
 * 이 함수의 반환값으로 덮어써서 사용한다.
 *
 * - 이벤트 시작 전: upcoming
 * - 시작 이후 ~ 3시간 이내: ongoing (별도 종료 시각 컬럼이 없어 임의 지속시간을 가정)
 * - 3시간 경과 후: ended
 */
export function computeEventStatus(
  eventDate: string,
  now: Date = new Date(),
  durationHours = 3,
): EventStatus {
  const start = new Date(eventDate).getTime();
  const end = start + durationHours * 60 * 60 * 1000;
  const current = now.getTime();

  if (current < start) return "upcoming";
  if (current < end) return "ongoing";
  return "ended";
}
