import { Suspense } from "react";
import { redirect } from "next/navigation";

import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { createClient } from "@/lib/supabase/server";
import { getUserProfile } from "@/lib/supabase/get-user-profile";

async function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims.sub;

  if (!userId) {
    redirect("/admin/login");
  }

  const profile = await getUserProfile(supabase, userId);

  if (profile?.role !== "admin") {
    redirect("/admin/login?error=forbidden");
  }

  return <>{children}</>;
}

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background flex min-h-screen">
      <Suspense>
        <AdminSidebar />
      </Suspense>
      <main className="flex-1 p-6">
        <Suspense>
          <AdminAuthGuard>{children}</AdminAuthGuard>
        </Suspense>
      </main>
    </div>
  );
}
