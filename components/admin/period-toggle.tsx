"use client";

const PERIOD_OPTIONS = [
  { value: "7d", label: "최근 7일" },
  { value: "30d", label: "최근 30일" },
  { value: "90d", label: "최근 90일" },
] as const;

export function PeriodToggle() {
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
          aria-pressed={option.value === "7d"}
          className={
            option.value === "7d"
              ? "rounded-sm bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground"
              : "rounded-sm px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted"
          }
          onClick={() => {
            // TODO: Task 011에서 기간 선택 상태 관리 및 데이터 재조회 로직 구현
          }}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
