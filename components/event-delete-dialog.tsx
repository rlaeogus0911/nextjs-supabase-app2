"use client";

import { useRouter } from "next/navigation";
import { TrashIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/client";
import { deleteEvent } from "@/lib/api/events";

interface EventDeleteDialogProps {
  eventId: string;
  eventTitle: string;
}

export function EventDeleteDialog({ eventId, eventTitle }: EventDeleteDialogProps) {
  const router = useRouter();

  const handleDelete = async () => {
    try {
      const supabase = createClient();
      await deleteEvent(supabase, eventId);
      toast.success("이벤트가 삭제되었습니다.");
      router.push("/events");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "이벤트 삭제에 실패했습니다.");
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="text-destructive hover:text-destructive flex-1">
          <TrashIcon className="size-4" />
          이벤트 삭제
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>이벤트를 삭제할까요?</DialogTitle>
          <DialogDescription>
            &quot;{eventTitle}&quot; 이벤트를 삭제하면 되돌릴 수 없습니다.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">취소</Button>
          </DialogClose>
          <Button variant="destructive" onClick={handleDelete}>
            삭제
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
