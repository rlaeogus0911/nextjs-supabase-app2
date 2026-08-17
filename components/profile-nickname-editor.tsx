"use client";

import { PencilIcon } from "lucide-react";
import { useState } from "react";

import { NicknameForm } from "@/components/nickname-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ProfileNicknameEditorProps {
  userId: string;
  nickname: string;
}

export function ProfileNicknameEditor({ userId, nickname }: ProfileNicknameEditorProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div className="flex items-center gap-1.5">
        <p className="text-lg font-semibold">{nickname}</p>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon" className="size-7" aria-label="닉네임 수정">
            <PencilIcon className="size-4" />
          </Button>
        </DialogTrigger>
      </div>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>닉네임 수정</DialogTitle>
        </DialogHeader>
        <NicknameForm
          userId={userId}
          defaultNickname={nickname}
          mode="edit"
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
