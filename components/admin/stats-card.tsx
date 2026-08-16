import type { LucideIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface StatsCardProps {
  /** 카드 제목(지표명) */
  title: string;
  /** 지표 값 */
  value: number | string;
  /** 지표 옆에 표시할 lucide 아이콘 */
  icon: LucideIcon;
  /** 지표에 대한 보조 설명(선택) */
  description?: string;
  className?: string;
}

/** 관리자 대시보드용 단일 지표 카드 */
export function StatsCard({ title, value, icon: Icon, description, className }: StatsCardProps) {
  return (
    <Card className={cn(className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
      </CardContent>
    </Card>
  );
}
