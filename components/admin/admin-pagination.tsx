"use client";

import { Button } from "@/components/ui/button";

interface AdminPaginationProps {
  totalLabel: string;
  ariaLabel: string;
}

export function AdminPagination({ totalLabel, ariaLabel }: AdminPaginationProps) {
  return (
    <nav
      aria-label={ariaLabel}
      className="flex items-center justify-between text-sm text-muted-foreground"
    >
      <p>{totalLabel}</p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled
          onClick={() => {
            // TODO: Task 011에서 이전 페이지 이동 로직 구현
          }}
        >
          이전
        </Button>
        <span aria-current="page" className="px-2">
          1 / 1
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled
          onClick={() => {
            // TODO: Task 011에서 다음 페이지 이동 로직 구현
          }}
        >
          다음
        </Button>
      </div>
    </nav>
  );
}
