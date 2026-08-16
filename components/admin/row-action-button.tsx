"use client";

import { MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";

interface RowActionButtonProps {
  ariaLabel: string;
}

export function RowActionButton({ ariaLabel }: RowActionButtonProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={ariaLabel}
      onClick={() => {
        // TODO: Task 011에서 상세/삭제 등 액션 메뉴 구현
      }}
    >
      <MoreHorizontal className="size-4" />
    </Button>
  );
}
