"use client";

import { usePathname, useSearchParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

interface AdminPaginationProps {
  page: number;
  totalPages: number;
  totalLabel: string;
  ariaLabel: string;
}

export function AdminPagination({ page, totalPages, totalLabel, ariaLabel }: AdminPaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const goToPage = (targetPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(targetPage));
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <nav
      aria-label={ariaLabel}
      className="text-muted-foreground flex items-center justify-between text-sm"
    >
      <p>{totalLabel}</p>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => goToPage(page - 1)}>
          이전
        </Button>
        <span aria-current="page" className="px-2">
          {page} / {totalPages || 1}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => goToPage(page + 1)}
        >
          다음
        </Button>
      </div>
    </nav>
  );
}
