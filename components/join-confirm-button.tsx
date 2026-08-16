"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

interface JoinConfirmButtonProps {
  eventId: string;
  eventTitle: string;
}

export function JoinConfirmButton({ eventId, eventTitle }: JoinConfirmButtonProps) {
  const router = useRouter();
  const [isJoining, setIsJoining] = useState(false);

  const handleJoin = () => {
    setIsJoining(true);
    // 목업 단계 - 실제 참여 처리(중복 참여 방지 포함)는 Task 010에서 API로 연동
    toast.success(`"${eventTitle}"에 참여했습니다.`);
    router.push(`/events/${eventId}`);
  };

  return (
    <Button size="lg" className="w-full" onClick={handleJoin} disabled={isJoining}>
      <CheckIcon className="size-4" />
      참여하기
    </Button>
  );
}
