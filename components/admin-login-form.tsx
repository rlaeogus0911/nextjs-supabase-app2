"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { GoogleAuthButton } from "@/components/google-auth-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";

interface AdminLoginFormProps extends React.ComponentPropsWithoutRef<"div"> {
  forbidden?: boolean;
}

export function AdminLoginForm({ className, forbidden, ...props }: AdminLoginFormProps) {
  const [error, setError] = useState<string | null>(forbidden ? "관리자 권한이 없습니다" : null);

  useEffect(() => {
    if (!forbidden) return;
    const supabase = createClient();
    void supabase.auth.signOut();
  }, [forbidden]);

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
          {error && <p className="mb-4 text-center text-sm text-red-400">{error}</p>}
          <GoogleAuthButton
            onError={setError}
            redirectTo={
              typeof window !== "undefined"
                ? `${window.location.origin}/auth/callback?next=/admin/dashboard`
                : undefined
            }
          />
          <p className="mt-4 text-center text-xs text-neutral-500">
            관리자 계정으로만 접근 가능합니다. 일반 사용자는 서비스 로그인 페이지를 이용해 주세요.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
