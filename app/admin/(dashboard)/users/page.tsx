import { AdminPagination } from "@/components/admin/admin-pagination";
import { RowActionButton } from "@/components/admin/row-action-button";
import { UsersToolbar } from "@/components/admin/users-toolbar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getMockAdminUserRows } from "@/lib/mock";
import type { UserRole } from "@/lib/types/user";

const ROLE_LABEL: Record<UserRole, string> = {
  user: "일반",
  admin: "관리자",
};

const ROLE_VARIANT: Record<UserRole, "secondary" | "default"> = {
  user: "secondary",
  admin: "default",
};

export default function AdminUsersPage() {
  const users = getMockAdminUserRows();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">사용자 관리</h1>
        <p className="text-sm text-muted-foreground">가입한 사용자를 검색하고 관리하세요.</p>
      </div>

      {/* 검색 및 필터 영역 - 동작은 구현되지 않은 정적 마크업 */}
      <UsersToolbar />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>사용자</TableHead>
              <TableHead>이메일</TableHead>
              <TableHead>역할</TableHead>
              <TableHead className="text-right">생성한 이벤트</TableHead>
              <TableHead className="text-right">참여한 이벤트</TableHead>
              <TableHead>가입일</TableHead>
              <TableHead className="text-right">
                <span className="sr-only">액션</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar size="sm">
                      {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt="" />}
                      <AvatarFallback>{user.name.slice(0, 1)}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{user.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{user.email}</TableCell>
                <TableCell>
                  <Badge variant={ROLE_VARIANT[user.role]}>{ROLE_LABEL[user.role]}</Badge>
                </TableCell>
                <TableCell className="text-right">{user.createdEventsCount}</TableCell>
                <TableCell className="text-right">{user.joinedEventsCount}</TableCell>
                <TableCell>{new Date(user.createdAt).toLocaleDateString("ko-KR")}</TableCell>
                <TableCell className="text-right">
                  <RowActionButton ariaLabel={`${user.name} 더보기`} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* 페이지네이션 - 동작 없는 정적 마크업 */}
      <AdminPagination totalLabel={`총 ${users.length}명`} ariaLabel="사용자 목록 페이지네이션" />
    </div>
  );
}
