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
import { createClient } from "@/lib/supabase/client";
import { createEvent, updateEvent } from "@/lib/api/events";
import { uploadEventCover } from "@/lib/supabase/storage";

interface EventFormProps {
  mode: "create" | "edit";
  event?: Event;
}

const MAX_COVER_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_COVER_EXTENSIONS = ["jpg", "jpeg", "png", "webp"];

function toDateTimeLocalValue(isoString: string) {
  const date = new Date(isoString);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 16);
}

export function EventForm({ mode, event }: EventFormProps) {
  const router = useRouter();
  const [coverPreview, setCoverPreview] = useState<string | null>(event?.coverImageUrl ?? null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (!ALLOWED_COVER_EXTENSIONS.includes(extension)) {
      toast.error("jpg, png, webp 형식의 이미지만 업로드할 수 있습니다.");
      return;
    }
    if (file.size > MAX_COVER_SIZE_BYTES) {
      toast.error("이미지 크기는 5MB 이하여야 합니다.");
      return;
    }

    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const onSubmit = async (values: CreateEventFormValues) => {
    setIsSubmitting(true);
    const supabase = createClient();

    try {
      const { data } = await supabase.auth.getClaims();
      const userId = data?.claims.sub;

      if (!userId) {
        toast.error("로그인이 필요합니다.");
        router.push("/auth/login");
        return;
      }

      let coverImageUrl = values.coverImageUrl || undefined;
      if (coverFile) {
        coverImageUrl = await uploadEventCover(supabase, coverFile, userId);
      }

      const eventInput = {
        title: values.title,
        description: values.description,
        location: values.location,
        eventDate: new Date(values.eventDate).toISOString(),
        coverImageUrl,
      };

      if (mode === "create") {
        const created = await createEvent(supabase, userId, eventInput);
        toast.success("이벤트가 생성되었습니다.");
        form.reset();
        setCoverFile(null);
        setCoverPreview(null);
        router.push(`/events/${created.id}`);
      } else if (event) {
        await updateEvent(supabase, event.id, eventInput);
        toast.success("이벤트가 수정되었습니다.");
        router.push(`/events/${event.id}`);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "요청 처리 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-2">
          <FormLabel>커버 이미지</FormLabel>
          <div className="bg-muted aspect-video w-full overflow-hidden rounded-lg border">
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
                  className="border-input placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-24 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-sm focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
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

        <Button type="submit" className="h-12 w-full" disabled={isSubmitting}>
          {isSubmitting ? "처리 중..." : mode === "create" ? "이벤트 생성" : "수정 완료"}
        </Button>
      </form>
    </Form>
  );
}
