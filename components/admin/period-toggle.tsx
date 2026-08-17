"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

const PERIOD_OPTIONS = [
  { value: "7d", label: "최근 7일" },
  { value: "30d", label: "최근 30일" },
  { value: "90d", label: "최근 90일" },
] as const;

export function PeriodToggle() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentPeriod = searchParams.get("period") ?? "7d";

  return (
    <div
      role="group"
      aria-label="통계 기간 선택"
      className="inline-flex w-fit items-center rounded-md border p-1"
    >
      {PERIOD_OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={option.value === currentPeriod}
          className={
            option.value === currentPeriod
              ? "bg-primary text-primary-foreground rounded-sm px-3 py-1.5 text-sm font-medium"
              : "text-muted-foreground hover:bg-muted rounded-sm px-3 py-1.5 text-sm font-medium"
          }
          onClick={() => {
            const params = new URLSearchParams(searchParams.toString());
            params.set("period", option.value);
            router.push(`${pathname}?${params.toString()}`);
          }}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
