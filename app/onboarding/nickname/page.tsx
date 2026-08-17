import { NicknameForm } from "@/components/nickname-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { getUserProfile } from "@/lib/supabase/get-user-profile";
import { redirect } from "next/navigation";

export default async function NicknameOnboardingPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims.sub;

  if (!userId) {
    redirect("/auth/login");
  }

  const profile = await getUserProfile(supabase, userId);

  if (profile?.username) {
    redirect("/events");
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">닉네임 설정</CardTitle>
            <CardDescription>다른 참여자에게 보여질 닉네임을 설정해주세요</CardDescription>
          </CardHeader>
          <CardContent>
            <NicknameForm userId={userId} defaultNickname={profile?.full_name} mode="onboarding" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
