"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { TimeSeriesPoint } from "@/lib/types/admin";

export interface EventTrendChartProps {
  data: TimeSeriesPoint[];
}

/** 이벤트 생성 추이 라인 차트 (클라이언트 컴포넌트, 데이터는 props로 주입) */
export function EventTrendChart({ data }: EventTrendChartProps) {
  return (
    <div className="h-64 w-full" role="img" aria-label="기간별 이벤트 생성 추이 라인 차트">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            className="fill-muted-foreground text-xs"
            tickFormatter={(value: string) => value.slice(5)}
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
          <Line
            type="monotone"
            dataKey="count"
            name="이벤트 수"
            stroke="hsl(var(--chart-1))"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
