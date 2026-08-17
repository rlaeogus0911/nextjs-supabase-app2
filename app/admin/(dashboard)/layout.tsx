import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { createClient } from "@/lib/supabase/server";
import { getUserProfile } from "@/lib/supabase/get-user-profile";
import { redirect } from "next/navigation";

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
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

  return (
    <div className="bg-background flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
