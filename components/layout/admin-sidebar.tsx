"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Calendar, LayoutDashboard, LogOut, Users } from "lucide-react";

import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "대시보드 메인", icon: LayoutDashboard },
  { href: "/admin/events", label: "이벤트 관리", icon: Calendar },
  { href: "/admin/users", label: "사용자 관리", icon: Users },
  { href: "/admin/analytics", label: "통계 분석", icon: BarChart3 },
] as const;

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-60 flex-col border-r border-border bg-card text-foreground">
      <div className="flex h-16 items-center px-4 text-lg font-semibold">Gather Admin</div>
      <nav className="flex flex-1 flex-col gap-1 px-2">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex h-12 items-center gap-3 rounded-md px-4 text-sm",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          );
        })}
      </nav>
      <button
        type="button"
        className="flex h-12 items-center gap-3 border-t border-border px-6 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        onClick={() => {
          // TODO: Task 008에서 실제 로그아웃 로직 구현
        }}
      >
        <LogOut className="size-4" />
        로그아웃
      </button>
    </aside>
  );
}
