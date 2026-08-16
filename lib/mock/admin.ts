import type {
  AdminEventRow,
  AdminUserRow,
  DashboardMetrics,
  StatsPeriod,
  TimeSeriesPoint,
} from "@/lib/types/admin";
import { getMockEvents } from "./events";
import { getMockUsers } from "./users";

/**
 * 관리자 페이지 전용 더미 데이터.
 * 기존 이벤트/사용자 더미(getMockEvents/getMockUsers)를 가공해 admin 뷰 모델을 만든다.
 * DashboardMetrics/TimeSeriesPoint 등은 실제 집계 대신 하드코딩된 값을 사용한다(Task 011에서 실제 쿼리로 교체 예정).
 */

export function getMockDashboardMetrics(): DashboardMetrics {
  return {
    eventsToday: 1,
    eventsThisWeek: 3,
    eventsThisMonth: 6,
    eventsTotal: 6,
    usersToday: 0,
    usersThisWeek: 2,
    usersTotal: 6,
  };
}

export function getMockAdminEventRows(): AdminEventRow[] {
  const users = getMockUsers();

  return getMockEvents().map((event) => ({
    id: event.id,
    title: event.title,
    hostName: users.find((user) => user.id === event.createdBy)?.name ?? "알 수 없음",
    eventDate: event.eventDate,
    participantCount: event.participantCount,
    status: event.status,
    createdAt: event.createdAt,
  }));
}

export function getMockAdminUserRows(): AdminUserRow[] {
  const events = getMockEvents();

  return getMockUsers().map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl,
    role: user.role,
    createdAt: user.createdAt,
    createdEventsCount: events.filter((event) => event.createdBy === user.id).length,
    joinedEventsCount: events.filter((event) => event.createdBy !== user.id).length,
  }));
}

const TIME_SERIES_LENGTH: Record<StatsPeriod, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
};

export function getMockEventTimeSeries(period: StatsPeriod): TimeSeriesPoint[] {
  const days = TIME_SERIES_LENGTH[period];
  const end = new Date("2026-08-16T09:00:00.000Z");

  return Array.from({ length: days }, (_, index) => {
    const date = new Date(end);
    date.setDate(date.getDate() - (days - 1 - index));
    const seed = (index * 37) % 11;
    return {
      date: date.toISOString().slice(0, 10),
      count: 1 + (seed % 5),
    };
  });
}

export function getMockUserTimeSeries(period: StatsPeriod): TimeSeriesPoint[] {
  const days = TIME_SERIES_LENGTH[period];
  const end = new Date("2026-08-16T09:00:00.000Z");

  return Array.from({ length: days }, (_, index) => {
    const date = new Date(end);
    date.setDate(date.getDate() - (days - 1 - index));
    const seed = (index * 23) % 9;
    return {
      date: date.toISOString().slice(0, 10),
      count: seed % 4,
    };
  });
}

export function getMockEventStatusDistribution(): { status: string; count: number }[] {
  const events = getMockEvents();
  const counts = events.reduce<Record<string, number>>((acc, event) => {
    acc[event.status] = (acc[event.status] ?? 0) + 1;
    return acc;
  }, {});

  return Object.entries(counts).map(([status, count]) => ({ status, count }));
}
