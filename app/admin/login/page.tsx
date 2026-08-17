import { AdminLoginForm } from "@/components/admin-login-form";
import { Suspense } from "react";

async function AdminLoginFormWithSearchParams({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return <AdminLoginForm forbidden={error === "forbidden"} />;
}

export default function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-neutral-950 p-5">
      <div className="w-full max-w-sm">
        <Suspense fallback={<AdminLoginForm />}>
          <AdminLoginFormWithSearchParams searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}
