"use client";

import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function UsersToolbar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1 sm:max-w-sm">
        <Search
          className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2"
          aria-hidden="true"
        />
        <Input
          type="search"
          placeholder="이름 또는 이메일로 검색"
          className="pl-9"
          aria-label="사용자 검색"
          defaultValue={searchParams.get("q") ?? ""}
          onChange={(event) => updateParam("q", event.target.value)}
        />
      </div>
      <Select
        defaultValue={searchParams.get("role") ?? "all"}
        onValueChange={(value) => updateParam("role", value)}
      >
        <SelectTrigger className="w-full sm:w-[160px]" aria-label="역할 필터">
          <SelectValue placeholder="역할 필터" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">전체 역할</SelectItem>
          <SelectItem value="user">일반</SelectItem>
          <SelectItem value="admin">관리자</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
