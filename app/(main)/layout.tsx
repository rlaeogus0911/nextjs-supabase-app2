import { Suspense } from "react";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { createClient } from "@/lib/supabase/server";
import { getUserProfile } from "@/lib/supabase/get-user-profile";
import { redirect } from "next/navigation";

async function AuthGuard({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims.sub;

  if (!userId) {
    redirect("/auth/login");
  }

  const profile = await getUserProfile(supabase, userId);
  if (!profile?.username) {
    redirect("/onboarding/nickname");
  }

  return <>{children}</>;
}

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-950">
      <div className="bg-background relative mx-auto min-h-screen w-full max-w-md pb-16">
        <Suspense>
          <AuthGuard>{children}</AuthGuard>
        </Suspense>
        <Suspense>
          <MobileBottomNav />
        </Suspense>
      </div>
    </div>
  );
}
