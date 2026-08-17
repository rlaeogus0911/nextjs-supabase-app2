"use client";

import { CopyIcon, MessageCircleIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

interface EventInviteLinkProps {
  inviteCode: string;
  /** 참여자 뷰 등에서 관리 성격이 강한 공유 채널(카카오톡)을 숨기고 복사만 제공 */
  shareOnly?: boolean;
}

export function EventInviteLink({ inviteCode, shareOnly = false }: EventInviteLinkProps) {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const inviteUrl = `${origin}/join/${inviteCode}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(inviteUrl);
    toast.success("초대 링크가 복사되었습니다.");
  };

  const handleKakaoShare = () => {
    toast.info("카카오톡 공유는 준비 중입니다.");
  };

  return (
    <div className="bg-card space-y-2 rounded-lg border p-3">
      <p className="text-muted-foreground truncate text-sm">{inviteUrl}</p>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" className="flex-1" onClick={handleCopy}>
          <CopyIcon className="size-4" />
          링크 복사
        </Button>
        {!shareOnly && (
          <Button size="sm" variant="outline" className="flex-1" onClick={handleKakaoShare}>
            <MessageCircleIcon className="size-4" />
            카카오톡 공유
          </Button>
        )}
      </div>
    </div>
  );
}
