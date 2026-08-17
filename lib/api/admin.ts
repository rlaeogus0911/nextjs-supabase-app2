import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/database.types";
import type { EventStatus } from "@/lib/types/event";
import type {
  AdminEventFilters,
  AdminEventRow,
  AdminUserFilters,
  AdminUserRow,
  DashboardMetrics,
  PaginatedResult,
  StatsPeriod,
  TimeSeriesPoint,
} from "@/lib/types/admin";

type EventRow = Database["public"]["Tables"]["events"]["Row"];
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

type AdminEventRowFromDb = EventRow & {
  profiles: Pick<ProfileRow, "full_name" | "username"> | null;
  event_participants: { count: number }[];
};

function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function startOfUtcWeek(date: Date): Date {
  const day = startOfUtcDay(date);
  const weekday = day.getUTCDay();
  day.setUTCDate(day.getUTCDate() - weekday);
  return day;
}

function startOfUtcMonth(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

async function countSince(
  supabase: SupabaseClient<Database>,
  table: "events" | "profiles",
  since: Date,
): Promise<number> {
  const { count, error } = await supabase
    .from(table)
    .select("*", { count: "exact", head: true })
    .gte("created_at", since.toISOString());

  if (error) {
    throw new Error(`${table} 집계에 실패했습니다: ${error.message}`);
  }

  return count ?? 0;
}

async function countTotal(
  supabase: SupabaseClient<Database>,
  table: "events" | "profiles",
): Promise<number> {
  const { count, error } = await supabase.from(table).select("*", { count: "exact", head: true });

  if (error) {
    throw new Error(`${table} 전체 집계에 실패했습니다: ${error.message}`);
  }

  return count ?? 0;
}

/** 대시보드 지표(오늘/이번 주/이번 달/전체 이벤트, 오늘/이번 주/전체 가입자)를 집계한다. */
export async function getDashboardMetrics(
  supabase: SupabaseClient<Database>,
): Promise<DashboardMetrics> {
  const now = new Date();
  const today = startOfUtcDay(now);
  const weekStart = startOfUtcWeek(now);
  const monthStart = startOfUtcMonth(now);

  const [
    eventsToday,
    eventsThisWeek,
    eventsThisMonth,
    eventsTotal,
    usersToday,
    usersThisWeek,
    usersTotal,
  ] = await Promise.all([
    countSince(supabase, "events", today),
    countSince(supabase, "events", weekStart),
    countSince(supabase, "events", monthStart),
    countTotal(supabase, "events"),
    countSince(supabase, "profiles", today),
    countSince(supabase, "profiles", weekStart),
    countTotal(supabase, "profiles"),
  ]);

  return {
    eventsToday,
    eventsThisWeek,
    eventsThisMonth,
    eventsTotal,
    usersToday,
    usersThisWeek,
    usersTotal,
  };
}

/** 관리자용 이벤트 목록을 검색/상태 필터/페이지네이션과 함께 조회한다. */
export async function getAdminEventRows(
  supabase: SupabaseClient<Database>,
  filters: AdminEventFilters,
): Promise<PaginatedResult<AdminEventRow>> {
  const { search, status, page, pageSize } = filters;

  let query = supabase
    .from("events")
    .select("*, profiles!events_created_by_fkey(full_name, username), event_participants(count)", {
      count: "exact",
    });

  if (search) {
    query = query.ilike("title", `%${search}%`);
  }
  if (status) {
    query = query.eq("status", status);
  }

  const from = (page - 1) * pageSize;
  const { data, error, count } = await query
    .order("created_at", { ascending: false })
    .range(from, from + pageSize - 1);

  if (error) {
    throw new Error(`이벤트 목록 조회에 실패했습니다: ${error.message}`);
  }

  const rows = ((data ?? []) as unknown as AdminEventRowFromDb[]).map((row): AdminEventRow => ({
    id: row.id,
    title: row.title,
    hostName: row.profiles?.full_name ?? row.profiles?.username ?? "알 수 없음",
    eventDate: row.event_date,
    participantCount: row.event_participants?.[0]?.count ?? 0,
    status: row.status as EventStatus,
    createdAt: row.created_at,
  }));

  return { rows, total: count ?? 0 };
}

/** 관리자용 사용자 목록을 검색/역할 필터/페이지네이션과 함께 조회한다. */
export async function getAdminUserRows(
  supabase: SupabaseClient<Database>,
  filters: AdminUserFilters,
): Promise<PaginatedResult<AdminUserRow>> {
  const { search, role, page, pageSize } = filters;

  let query = supabase.from("profiles").select("*", { count: "exact" });

  if (search) {
    query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
  }
  if (role) {
    query = query.eq("role", role);
  }

  const from = (page - 1) * pageSize;
  const { data, error, count } = await query
    .order("created_at", { ascending: false })
    .range(from, from + pageSize - 1);

  if (error) {
    throw new Error(`사용자 목록 조회에 실패했습니다: ${error.message}`);
  }

  const profiles = (data ?? []) as ProfileRow[];
  const userIds = profiles.map((profile) => profile.id);

  const createdCountByUser = new Map<string, number>();
  const joinedCountByUser = new Map<string, number>();

  if (userIds.length > 0) {
    const [createdEventsResult, participationsResult] = await Promise.all([
      supabase.from("events").select("created_by").in("created_by", userIds),
      supabase.from("event_participants").select("user_id").in("user_id", userIds),
    ]);

    if (createdEventsResult.error) {
      throw new Error(`생성한 이벤트 집계에 실패했습니다: ${createdEventsResult.error.message}`);
    }
    if (participationsResult.error) {
      throw new Error(`참여한 이벤트 집계에 실패했습니다: ${participationsResult.error.message}`);
    }

    for (const row of createdEventsResult.data ?? []) {
      createdCountByUser.set(row.created_by, (createdCountByUser.get(row.created_by) ?? 0) + 1);
    }
    for (const row of participationsResult.data ?? []) {
      joinedCountByUser.set(row.user_id, (joinedCountByUser.get(row.user_id) ?? 0) + 1);
    }
  }

  const rows = profiles.map((profile): AdminUserRow => ({
    id: profile.id,
    name: profile.full_name ?? profile.username ?? "이름 없음",
    email: profile.email,
    avatarUrl: profile.avatar_url,
    role: profile.role as AdminUserRow["role"],
    createdAt: profile.created_at,
    createdEventsCount: createdCountByUser.get(profile.id) ?? 0,
    joinedEventsCount: joinedCountByUser.get(profile.id) ?? 0,
  }));

  return { rows, total: count ?? 0 };
}

/** 관리자 권한으로 이벤트를 삭제한다. (RLS events_delete_admin에 위임) */
export async function deleteEventAsAdmin(
  supabase: SupabaseClient<Database>,
  eventId: string,
): Promise<void> {
  const { error } = await supabase.from("events").delete().eq("id", eventId);

  if (error) {
    throw new Error(`이벤트 삭제에 실패했습니다: ${error.message}`);
  }
}

/**
 * 관리자 권한으로 사용자를 삭제한다. (RLS profiles_delete_admin에 위임)
 * profiles row만 삭제되며 auth.users는 남는다(service role key 미도입으로 범위 제외, 알려진 제약).
 */
export async function deleteUserAsAdmin(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<void> {
  const { error } = await supabase.from("profiles").delete().eq("id", userId);

  if (error) {
    throw new Error(`사용자 삭제에 실패했습니다: ${error.message}`);
  }
}

const TIME_SERIES_LENGTH: Record<StatsPeriod, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
};

function buildTimeSeries(days: number, timestamps: string[]): TimeSeriesPoint[] {
  const countByDate = new Map<string, number>();
  for (const timestamp of timestamps) {
    const date = timestamp.slice(0, 10);
    countByDate.set(date, (countByDate.get(date) ?? 0) + 1);
  }

  const end = startOfUtcDay(new Date());
  return Array.from({ length: days }, (_, index) => {
    const date = new Date(end);
    date.setUTCDate(date.getUTCDate() - (days - 1 - index));
    const key = date.toISOString().slice(0, 10);
    return { date: key, count: countByDate.get(key) ?? 0 };
  });
}

/** 기간별 이벤트 생성 추이를 집계한다. (PostgREST GROUP BY 미지원으로 in-memory 집계) */
export async function getEventTimeSeries(
  supabase: SupabaseClient<Database>,
  period: StatsPeriod,
): Promise<TimeSeriesPoint[]> {
  const days = TIME_SERIES_LENGTH[period];
  const start = new Date(startOfUtcDay(new Date()));
  start.setUTCDate(start.getUTCDate() - (days - 1));

  const { data, error } = await supabase
    .from("events")
    .select("created_at")
    .gte("created_at", start.toISOString());

  if (error) {
    throw new Error(`이벤트 추이 집계에 실패했습니다: ${error.message}`);
  }

  return buildTimeSeries(
    days,
    (data ?? []).map((row) => row.created_at),
  );
}

/** 기간별 신규 가입자 추이를 집계한다. (PostgREST GROUP BY 미지원으로 in-memory 집계) */
export async function getUserTimeSeries(
  supabase: SupabaseClient<Database>,
  period: StatsPeriod,
): Promise<TimeSeriesPoint[]> {
  const days = TIME_SERIES_LENGTH[period];
  const start = new Date(startOfUtcDay(new Date()));
  start.setUTCDate(start.getUTCDate() - (days - 1));

  const { data, error } = await supabase
    .from("profiles")
    .select("created_at")
    .gte("created_at", start.toISOString());

  if (error) {
    throw new Error(`가입자 추이 집계에 실패했습니다: ${error.message}`);
  }

  return buildTimeSeries(
    days,
    (data ?? []).map((row) => row.created_at),
  );
}

/** 이벤트 상태별 분포를 집계한다. */
export async function getEventStatusDistribution(
  supabase: SupabaseClient<Database>,
): Promise<{ status: string; count: number }[]> {
  const { data, error } = await supabase.from("events").select("status");

  if (error) {
    throw new Error(`이벤트 상태 분포 집계에 실패했습니다: ${error.message}`);
  }

  const counts = (data ?? []).reduce<Record<string, number>>((acc, row) => {
    acc[row.status] = (acc[row.status] ?? 0) + 1;
    return acc;
  }, {});

  return Object.entries(counts).map(([status, count]) => ({ status, count }));
}
