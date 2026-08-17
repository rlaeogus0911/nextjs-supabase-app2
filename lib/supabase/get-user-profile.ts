import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

/** profiles 테이블에서 role을 포함한 프로필 정보를 조회한다. row가 없으면 null을 반환한다. */
export async function getUserProfile(
  supabase: SupabaseClient,
  userId: string,
): Promise<ProfileRow | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single<ProfileRow>();

  if (error || !data) {
    return null;
  }

  return data;
}
