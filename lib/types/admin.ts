import type { EventStatus } from "./event";
import type { UserRole } from "./user";

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

export interface PaginatedResult<T> {
  rows: T[];
  total: number;
}

export interface AdminEventFilters {
  search?: string;
  status?: EventStatus;
  page: number;
  pageSize: number;
}

export interface AdminUserFilters {
  search?: string;
  role?: UserRole;
  page: number;
  pageSize: number;
}
