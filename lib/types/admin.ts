import type { EventStatus } from "./event";
import type { UserRole } from "./user";

/**
 * 임시 타입 - Task 007에서 실제 DB 스키마 타입(generate_typescript_types 생성물)으로 교체 예정
 */

export interface DashboardMetrics {
  eventsToday: number;
  eventsThisWeek: number;
  eventsThisMonth: number;
  eventsTotal: number;
  usersToday: number;
  usersThisWeek: number;
  usersTotal: number;
}

export interface AdminEventRow {
  id: string;
  title: string;
  hostName: string;
  eventDate: string;
  participantCount: number;
  status: EventStatus;
  createdAt: string;
}

export interface AdminUserRow {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  role: UserRole;
  createdAt: string;
  createdEventsCount: number;
  joinedEventsCount: number;
}

export type StatsPeriod = "7d" | "30d" | "90d";

export interface TimeSeriesPoint {
  date: string;
  count: number;
}
