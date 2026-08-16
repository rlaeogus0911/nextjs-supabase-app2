"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck } from "lucide-react";
import { useState } from "react";

export function AdminLoginForm({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
  // TODO: Task 006에서 실제 관리자 role 체크 로그인 로직(useState 상태 관리 포함)으로 교체
  const [email] = useState("");
  const [password] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Task 006에서 관리자 인증 및 role 검증 로직 구현
  };

  return (
    <div className={cn("flex w-full flex-col gap-6", className)} {...props}>
      <Card className="border-neutral-800 bg-neutral-900 text-neutral-100">
        <CardHeader className="items-center text-center">
          <div className="mb-2 flex size-12 items-center justify-center rounded-full bg-neutral-800">
            <ShieldCheck className="size-6 text-neutral-100" aria-hidden="true" />
          </div>
          <CardTitle className="text-2xl">관리자 로그인</CardTitle>
          <CardDescription className="text-neutral-400">
            관리자 계정으로만 접근 가능합니다
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="admin-email" className="text-neutral-200">
                  이메일
                </Label>
                <Input
                  id="admin-email"
                  type="email"
                  placeholder="admin@example.com"
                  required
                  value={email}
                  onChange={() => {
                    // TODO: Task 006에서 이메일 입력 상태 관리 구현
                  }}
                  className="border-neutral-700 bg-neutral-950 text-neutral-100 placeholder:text-neutral-500"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="admin-password" className="text-neutral-200">
                  비밀번호
                </Label>
                <Input
                  id="admin-password"
                  type="password"
                  required
                  value={password}
                  onChange={() => {
                    // TODO: Task 006에서 비밀번호 입력 상태 관리 구현
                  }}
                  className="border-neutral-700 bg-neutral-950 text-neutral-100 placeholder:text-neutral-500"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-neutral-100 text-neutral-900 hover:bg-neutral-300"
              >
                로그인
              </Button>
            </div>
          </form>
          <p className="mt-4 text-center text-xs text-neutral-500">
            관리자 계정으로만 접근 가능합니다. 일반 사용자는 서비스 로그인 페이지를 이용해 주세요.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
