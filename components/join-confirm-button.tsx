"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { joinEvent } from "@/lib/api/participants";

interface JoinConfirmButtonProps {
  eventId: string;
  eventTitle: string;
  alreadyJoined: boolean;
}

export function JoinConfirmButton({ eventId, eventTitle, alreadyJoined }: JoinConfirmButtonProps) {
  const router = useRouter();
  const [isJoining, setIsJoining] = useState(false);

  if (alreadyJoined) {
    return (
      <Button size="lg" className="w-full" onClick={() => router.push(`/events/${eventId}`)}>
        이벤트로 이동
      </Button>
    );
  }

  const handleJoin = async () => {
    setIsJoining(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error("로그인이 필요합니다.");
        router.push("/auth/login");
        return;
      }

      await joinEvent(supabase, eventId, user.id);
      toast.success(`"${eventTitle}"에 참여했습니다.`);
      router.push(`/events/${eventId}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "참여 처리에 실패했습니다.");
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <Button size="lg" className="w-full" onClick={handleJoin} disabled={isJoining}>
      <CheckIcon className="size-4" />
      참여하기
    </Button>
  );
}
