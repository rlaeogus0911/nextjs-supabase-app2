import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogoutButton } from "@/components/logout-button";
import { getMockCurrentUser, getMockMyEvents } from "@/lib/mock";

export default function ProfilePage() {
  // 목업 단계 - 실제 로그인 사용자 정보는 Task 008 인증 시스템 완성 후 연동
  const user = getMockCurrentUser();
  const myEvents = getMockMyEvents();
  const hostedCount = myEvents.filter((e) => e.role === "host").length;
  const participatedCount = myEvents.filter((e) => e.role === "participant").length;
  const joinedDate = new Date(user.createdAt).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-6 p-5">
      <h1 className="text-2xl font-bold">프로필</h1>

      <div className="flex flex-col items-center gap-3">
        <Avatar size="lg" className="size-20">
          {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.name} />}
          <AvatarFallback className="text-xl">{user.name.slice(0, 1)}</AvatarFallback>
        </Avatar>
        <p className="text-lg font-semibold">{user.name}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border bg-card p-4 text-center">
          <p className="text-2xl font-bold">{hostedCount}</p>
          <p className="text-sm text-muted-foreground">주최한 이벤트</p>
        </div>
        <div className="rounded-lg border bg-card p-4 text-center">
          <p className="text-2xl font-bold">{participatedCount}</p>
          <p className="text-sm text-muted-foreground">참여한 이벤트</p>
        </div>
      </div>

      <div className="divide-y rounded-lg border">
        <div className="flex items-center justify-between p-4">
          <span className="text-sm text-muted-foreground">이메일</span>
          <span className="text-sm">{user.email}</span>
        </div>
        <div className="flex items-center justify-between p-4">
          <span className="text-sm text-muted-foreground">가입일</span>
          <span className="text-sm">{joinedDate}</span>
        </div>
      </div>

      <LogoutButton />
    </div>
  );
}
