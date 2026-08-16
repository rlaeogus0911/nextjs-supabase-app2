import { z } from "zod";

export const createEventSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "제목을 입력해주세요.")
    .max(50, "제목은 최대 50자까지 입력할 수 있습니다."),
  description: z.string().trim().max(500, "설명은 최대 500자까지 입력할 수 있습니다.").optional(),
  location: z
    .string()
    .trim()
    .min(1, "장소를 입력해주세요.")
    .max(100, "장소는 최대 100자까지 입력할 수 있습니다."),
  eventDate: z.string().min(1, "날짜와 시간을 선택해주세요."),
  coverImageUrl: z.string().optional(),
});

export const updateEventSchema = createEventSchema.partial();

export type CreateEventFormValues = z.infer<typeof createEventSchema>;
export type UpdateEventFormValues = z.infer<typeof updateEventSchema>;
