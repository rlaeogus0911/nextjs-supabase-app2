import type { SupabaseClient } from "@supabase/supabase-js";

const EVENT_COVERS_BUCKET = "event-covers";

/**
 * event-covers 버킷에 커버 이미지를 업로드하고 공개 URL을 반환한다. (F009)
 * 버킷은 public이므로 업로드 성공 후 바로 getPublicUrl로 접근 가능한 URL을 얻는다.
 */
export async function uploadEventCover(
  supabase: SupabaseClient,
  file: File,
  userId: string,
): Promise<string> {
  const extension = file.name.split(".").pop() ?? "jpg";
  const path = `${userId}/${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage.from(EVENT_COVERS_BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });

  if (error) {
    throw new Error(`커버 이미지 업로드에 실패했습니다: ${error.message}`);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(EVENT_COVERS_BUCKET).getPublicUrl(path);

  return publicUrl;
}
