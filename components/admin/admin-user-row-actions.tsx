"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { RowActionButton } from "@/components/admin/row-action-button";
import { deleteUserAsAdmin } from "@/lib/api/admin";
import { createClient } from "@/lib/supabase/client";

interface AdminUserRowActionsProps {
  userId: string;
  userName: string;
  isSelf: boolean;
}

export function AdminUserRowActions({ userId, userName, isSelf }: AdminUserRowActionsProps) {
  const router = useRouter();

  const handleDelete = async () => {
    try {
      const supabase = createClient();
      await deleteUserAsAdmin(supabase, userId);
      toast.success(`"${userName}" 사용자를 삭제했습니다.`);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "사용자 삭제에 실패했습니다.");
    }
  };

  return (
    <RowActionButton
      ariaLabel={`${userName} 더보기`}
      itemLabel={`"${userName}" 사용자`}
      onDelete={handleDelete}
      disabled={isSelf}
    />
  );
}
