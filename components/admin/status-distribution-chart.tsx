"use client";

import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis, ResponsiveContainer } from "recharts";

export interface StatusDistributionChartProps {
  data: { status: string; count: number }[];
}

const STATUS_LABEL: Record<string, string> = {
  upcoming: "예정",
  ongoing: "진행 중",
  ended: "종료",
};

/** 이벤트 상태별 분포 바 차트 (클라이언트 컴포넌트, 데이터는 props로 주입) */
export function StatusDistributionChart({ data }: StatusDistributionChartProps) {
  const chartData = data.map((item) => ({
    ...item,
    label: STATUS_LABEL[item.status] ?? item.status,
  }));

  return (
    <div className="h-64 w-full" role="img" aria-label="이벤트 상태별 분포 막대 차트">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            className="fill-muted-foreground text-xs"
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            className="fill-muted-foreground text-xs"
            width={32}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--popover))",
              borderColor: "hsl(var(--border))",
              color: "hsl(var(--popover-foreground))",
              fontSize: 12,
              borderRadius: 6,
            }}
          />
          <Bar dataKey="count" name="이벤트 수" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
