"use client";

import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function EventsToolbar() {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1 sm:max-w-sm">
        <Search
          className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          type="search"
          placeholder="이벤트 제목으로 검색"
          className="pl-9"
          aria-label="이벤트 검색"
          onChange={() => {
            // TODO: Task 011에서 실제 검색 로직 구현
          }}
        />
      </div>
      <Select defaultValue="all">
        <SelectTrigger className="w-full sm:w-[160px]" aria-label="상태 필터">
          <SelectValue placeholder="상태 필터" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">전체 상태</SelectItem>
          <SelectItem value="upcoming">예정</SelectItem>
          <SelectItem value="ongoing">진행 중</SelectItem>
          <SelectItem value="ended">종료</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
