"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface NicknameFormProps {
  userId: string;
  defaultNickname?: string | null;
  /** onboarding: 저장 후 /events로 이동. edit: 저장 후 onSuccess만 호출(다이얼로그 닫기 등) */
  mode: "onboarding" | "edit";
  onSuccess?: () => void;
}

export function NicknameForm({ userId, defaultNickname, mode, onSuccess }: NicknameFormProps) {
  const [nickname, setNickname] = useState(defaultNickname ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = nickname.trim();

    if (!trimmed) {
      setError("닉네임을 입력해주세요");
      return;
    }
    if (trimmed.length > 20) {
      setError("닉네임은 20자 이하로 입력해주세요");
      return;
    }

    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ username: trimmed })
        .eq("id", userId);

      if (error) {
        if (error.code === "23505") {
          throw new Error("이미 사용 중인 닉네임입니다");
        }
        throw error;
      }

      router.refresh();
      if (mode === "onboarding") {
        router.push("/events");
      } else {
        onSuccess?.();
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "오류가 발생했습니다");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid gap-2">
        <Label htmlFor="nickname">닉네임</Label>
        <Input
          id="nickname"
          type="text"
          placeholder="사용할 닉네임을 입력하세요"
          required
          maxLength={20}
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
        />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "저장 중..." : "저장"}
      </Button>
    </form>
  );
}
