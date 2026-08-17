import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EventTrendChart } from "@/components/admin/event-trend-chart";
import { UserTrendChart } from "@/components/admin/user-trend-chart";
import { StatusDistributionChart } from "@/components/admin/status-distribution-chart";
import { PeriodToggle } from "@/components/admin/period-toggle";
import { getEventStatusDistribution, getEventTimeSeries, getUserTimeSeries } from "@/lib/api/admin";
import { createClient } from "@/lib/supabase/server";
import type { StatsPeriod } from "@/lib/types/admin";

interface AdminAnalyticsPageProps {
  searchParams: Promise<{ period?: string }>;
}

export default async function AdminAnalyticsPage({ searchParams }: AdminAnalyticsPageProps) {
  const { period: periodParam } = await searchParams;
  const period: StatsPeriod = periodParam === "30d" || periodParam === "90d" ? periodParam : "7d";

  const supabase = await createClient();
  const [eventSeries, userSeries, statusDistribution] = await Promise.all([
    getEventTimeSeries(supabase, period),
    getUserTimeSeries(supabase, period),
    getEventStatusDistribution(supabase),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">통계 분석</h1>
          <p className="text-muted-foreground text-sm">기간별 이벤트/가입자 추이를 확인하세요.</p>
        </div>

        <PeriodToggle />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">이벤트 생성 추이</CardTitle>
          </CardHeader>
          <CardContent>
            <EventTrendChart data={eventSeries} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">신규 가입자 추이</CardTitle>
          </CardHeader>
          <CardContent>
            <UserTrendChart data={userSeries} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">이벤트 상태별 분포</CardTitle>
        </CardHeader>
        <CardContent>
          <StatusDistributionChart data={statusDistribution} />
        </CardContent>
      </Card>
    </div>
  );
}
