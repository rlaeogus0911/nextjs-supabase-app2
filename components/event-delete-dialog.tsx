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

interface EventDeleteDialogProps {
  eventTitle: string;
}

export function EventDeleteDialog({ eventTitle }: EventDeleteDialogProps) {
  const router = useRouter();

  const handleDelete = () => {
    // 목업 단계 - 실제 삭제는 Task 009에서 API 연동
    toast.success("이벤트가 삭제되었습니다.");
    router.push("/events");
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex-1 text-destructive hover:text-destructive">
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
