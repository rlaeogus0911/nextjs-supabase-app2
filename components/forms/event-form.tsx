"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { createEventSchema, type CreateEventFormValues } from "@/lib/schemas/event";
import type { Event } from "@/lib/types/event";

interface EventFormProps {
  mode: "create" | "edit";
  event?: Event;
}

function toDateTimeLocalValue(isoString: string) {
  const date = new Date(isoString);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 16);
}

export function EventForm({ mode, event }: EventFormProps) {
  const router = useRouter();
  const [coverPreview, setCoverPreview] = useState<string | null>(event?.coverImageUrl ?? null);

  const form = useForm<CreateEventFormValues>({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      title: event?.title ?? "",
      description: event?.description ?? "",
      location: event?.location ?? "",
      eventDate: event ? toDateTimeLocalValue(event.eventDate) : "",
      coverImageUrl: event?.coverImageUrl ?? "",
    },
  });

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setCoverPreview(url);
  };

  const onSubmit = (values: CreateEventFormValues) => {
    // 목업 단계 - 실제 저장은 Task 009에서 API 연동
    console.log(`[${mode}] event form submit`, values);
    toast.success(mode === "create" ? "이벤트가 생성되었습니다." : "이벤트가 수정되었습니다.");
    router.push(mode === "create" ? "/events" : `/events/${event?.id}`);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-2">
          <FormLabel>커버 이미지</FormLabel>
          <div className="aspect-video w-full overflow-hidden rounded-lg border bg-muted">
            {coverPreview && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={coverPreview}
                alt="커버 이미지 미리보기"
                className="size-full object-cover"
              />
            )}
          </div>
          <Input type="file" accept="image/*" onChange={handleCoverChange} />
        </div>

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>제목</FormLabel>
              <FormControl>
                <Input placeholder="이벤트 제목을 입력하세요" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>설명</FormLabel>
              <FormControl>
                <textarea
                  className="flex min-h-24 w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                  placeholder="이벤트에 대한 설명을 입력하세요"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="eventDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>날짜 및 시간</FormLabel>
              <FormControl>
                <Input type="datetime-local" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>장소</FormLabel>
              <FormControl>
                <Input placeholder="이벤트 장소를 입력하세요" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="h-12 w-full">
          {mode === "create" ? "이벤트 생성" : "수정 완료"}
        </Button>
      </form>
    </Form>
  );
}
