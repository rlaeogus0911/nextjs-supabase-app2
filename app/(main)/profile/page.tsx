import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogoutButton } from "@/components/logout-button";
import { ProfileNicknameEditor } from "@/components/profile-nickname-editor";
import { createClient } from "@/lib/supabase/server";
import { getUserProfile } from "@/lib/supabase/get-user-profile";
import { getEvents } from "@/lib/api/events";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims.sub;

  if (!userId) {
    redirect("/auth/login");
  }

  const profile = await getUserProfile(supabase, userId);
  if (!profile) {
    redirect("/auth/login");
  }

  const myEvents = await getEvents(supabase, userId);
  const hostedCount = myEvents.filter((e) => e.role === "host").length;
  const participatedCount = myEvents.filter((e) => e.role === "participant").length;

  const displayName = profile.username ?? profile.full_name ?? profile.email;
  const joinedDate = new Date(profile.created_at).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-6 p-5">
      <h1 className="text-2xl font-bold">프로필</h1>

      <div className="flex flex-col items-center gap-3">
        <Avatar size="lg" className="size-20">
          {profile.avatar_url && <AvatarImage src={profile.avatar_url} alt={displayName} />}
          <AvatarFallback className="text-xl">{displayName.slice(0, 1)}</AvatarFallback>
        </Avatar>
        <ProfileNicknameEditor userId={userId} nickname={displayName} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card rounded-lg border p-4 text-center">
          <p className="text-2xl font-bold">{hostedCount}</p>
          <p className="text-muted-foreground text-sm">주최한 이벤트</p>
        </div>
        <div className="bg-card rounded-lg border p-4 text-center">
          <p className="text-2xl font-bold">{participatedCount}</p>
          <p className="text-muted-foreground text-sm">참여한 이벤트</p>
        </div>
      </div>

      <div className="divide-y rounded-lg border">
        <div className="flex items-center justify-between p-4">
          <span className="text-muted-foreground text-sm">이메일</span>
          <span className="text-sm">{profile.email}</span>
        </div>
        <div className="flex items-center justify-between p-4">
          <span className="text-muted-foreground text-sm">가입일</span>
          <span className="text-sm">{joinedDate}</span>
        </div>
      </div>

      <LogoutButton />
    </div>
  );
}
