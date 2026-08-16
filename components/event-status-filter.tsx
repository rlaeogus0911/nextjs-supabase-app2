"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { EventCard } from "@/components/event-card";
import { EmptyState } from "@/components/empty-state";
import type { EventStatus } from "@/lib/types/event";
import type { MyEvent } from "@/lib/mock";

type FilterValue = EventStatus | "all";

const FILTERS: { value: FilterValue; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "upcoming", label: "예정" },
  { value: "ongoing", label: "진행 중" },
  { value: "ended", label: "종료" },
];

interface EventStatusFilterProps {
  items: MyEvent[];
}

export function EventStatusFilter({ items }: EventStatusFilterProps) {
  const [filter, setFilter] = useState<FilterValue>("all");

  const filteredItems =
    filter === "all" ? items : items.filter(({ event }) => event.status === filter);

  return (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto">
        {FILTERS.map(({ value, label }) => (
          <Button
            key={value}
            size="sm"
            variant={filter === value ? "default" : "outline"}
            onClick={() => setFilter(value)}
          >
            {label}
          </Button>
        ))}
      </div>

      {filteredItems.length === 0 ? (
        <EmptyState title="표시할 이벤트가 없습니다" description="다른 상태 필터를 선택해보세요." />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredItems.map(({ event, role }) => (
            <EventCard key={event.id} event={event} href={`/events/${event.id}`} role={role} />
          ))}
        </div>
      )}
    </div>
  );
}
