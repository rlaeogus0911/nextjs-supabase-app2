"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { RowActionButton } from "@/components/admin/row-action-button";
import { deleteEventAsAdmin } from "@/lib/api/admin";
import { createClient } from "@/lib/supabase/client";

interface AdminEventRowActionsProps {
  eventId: string;
  eventTitle: string;
}

export function AdminEventRowActions({ eventId, eventTitle }: AdminEventRowActionsProps) {
  const router = useRouter();

  const handleDelete = async () => {
    try {
      const supabase = createClient();
      await deleteEventAsAdmin(supabase, eventId);
      toast.success(`"${eventTitle}" 이벤트를 삭제했습니다.`);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "이벤트 삭제에 실패했습니다.");
    }
  };

  return (
    <RowActionButton
      ariaLabel={`${eventTitle} 더보기`}
      itemLabel={`"${eventTitle}" 이벤트`}
      onDelete={handleDelete}
    />
  );
}
