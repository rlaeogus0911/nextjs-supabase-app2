import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-950">
      <div className="relative mx-auto min-h-screen w-full max-w-md bg-background pb-16">
        {children}
        <MobileBottomNav />
      </div>
    </div>
  );
}
