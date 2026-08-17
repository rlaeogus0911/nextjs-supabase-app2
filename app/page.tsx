import { CalendarPlus, Link2, Users } from "lucide-react";

import { EnvVarWarning } from "@/components/env-var-warning";
import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { hasEnvVars } from "@/lib/utils";
import Link from "next/link";
import { Suspense } from "react";

const FEATURES = [
  {
    icon: CalendarPlus,
    title: "간편한 이벤트 생성",
    description: "제목, 날짜, 장소만 입력하면 즉시 이벤트가 만들어져요.",
  },
  {
    icon: Link2,
    title: "원클릭 초대 링크",
    description: "자동 생성된 초대 링크를 카카오톡으로 간편하게 공유하세요.",
  },
  {
    icon: Users,
    title: "실시간 참여자 관리",
    description: "참여자 목록이 실시간으로 업데이트되어 현황을 바로 확인해요.",
  },
];

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center">
      <div className="flex w-full flex-1 flex-col items-center gap-16">
        <nav className="border-b-foreground/10 flex h-14 w-full justify-center border-b sm:h-16">
          <div className="flex w-full max-w-5xl items-center justify-between p-3 px-4 text-sm sm:px-5">
            <div className="flex items-center gap-5 font-semibold">
              <Link href={"/"}>Gather</Link>
            </div>
            {!hasEnvVars ? (
              <EnvVarWarning />
            ) : (
              <Suspense>
                <AuthButton />
              </Suspense>
            )}
          </div>
        </nav>

        <div className="flex w-full max-w-md flex-1 flex-col items-center gap-6 p-4 text-center sm:gap-8 sm:p-6">
          <h1 className="text-2xl font-bold sm:text-3xl">Gather</h1>
          <p className="text-muted-foreground text-base sm:text-lg">
            초대 링크 하나로 모든 것을 해결하는 일회성 이벤트 관리 플랫폼
          </p>

          <div className="grid w-full grid-cols-1 gap-3 sm:gap-4">
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <Card key={title}>
                <CardHeader className="flex flex-row items-center gap-3 space-y-0">
                  <Icon className="text-primary size-6 shrink-0" />
                  <CardTitle className="text-base">{title}</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground text-left text-sm">
                  {description}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <footer className="mx-auto flex w-full items-center justify-center gap-8 border-t py-10 text-center text-xs sm:py-16">
          <p>Gather</p>
          <ThemeSwitcher />
        </footer>
      </div>
    </main>
  );
}
