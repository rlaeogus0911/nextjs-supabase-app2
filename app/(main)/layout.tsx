import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (!data?.claims) {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-950">
      <div className="bg-background relative mx-auto min-h-screen w-full max-w-md pb-16">
        {children}
        <MobileBottomNav />
      </div>
    </div>
  );
}
