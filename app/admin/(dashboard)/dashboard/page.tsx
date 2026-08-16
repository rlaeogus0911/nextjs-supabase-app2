import {
  CalendarDays,
  CalendarPlus,
  CalendarRange,
  Users,
  UserPlus,
  UsersRound,
} from "lucide-react";

import { StatsCard } from "@/components/admin/stats-card";
import { getMockDashboardMetrics } from "@/lib/mock";

export default function AdminDashboardPage() {
  const metrics = getMockDashboardMetrics();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">대시보드</h1>
        <p className="text-sm text-muted-foreground">
          서비스 전반의 주요 지표를 한눈에 확인하세요.
        </p>
      </div>

      <section
        aria-label="이벤트 지표"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <StatsCard title="오늘 생성된 이벤트" value={metrics.eventsToday} icon={CalendarPlus} />
        <StatsCard title="이번 주 이벤트" value={metrics.eventsThisWeek} icon={CalendarDays} />
        <StatsCard title="이번 달 이벤트" value={metrics.eventsThisMonth} icon={CalendarRange} />
        <StatsCard title="전체 이벤트" value={metrics.eventsTotal} icon={Users} />
      </section>

      <section
        aria-label="사용자 지표"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <StatsCard title="오늘 가입자" value={metrics.usersToday} icon={UserPlus} />
        <StatsCard title="이번 주 가입자" value={metrics.usersThisWeek} icon={UsersRound} />
        <StatsCard title="전체 사용자" value={metrics.usersTotal} icon={Users} />
      </section>
    </div>
  );
}
