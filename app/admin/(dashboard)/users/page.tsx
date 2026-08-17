import { AdminPagination } from "@/components/admin/admin-pagination";
import { AdminUserRowActions } from "@/components/admin/admin-user-row-actions";
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
import { getAdminUserRows } from "@/lib/api/admin";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/types/user";

const ROLE_LABEL: Record<UserRole, string> = {
  user: "일반",
  admin: "관리자",
};

const ROLE_VARIANT: Record<UserRole, "secondary" | "default"> = {
  user: "secondary",
  admin: "default",
};

const PAGE_SIZE = 20;

interface AdminUsersPageProps {
  searchParams: Promise<{ q?: string; role?: string; page?: string }>;
}

export default async function AdminUsersPage({ searchParams }: AdminUsersPageProps) {
  const { q, role, page: pageParam } = await searchParams;
  const page = Number(pageParam) || 1;

  const supabase = await createClient();
  const [{ rows: users, total }, { data: claims }] = await Promise.all([
    getAdminUserRows(supabase, {
      search: q,
      role: role as UserRole | undefined,
      page,
      pageSize: PAGE_SIZE,
    }),
    supabase.auth.getClaims(),
  ]);

  const currentUserId = claims?.claims.sub;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">사용자 관리</h1>
        <p className="text-muted-foreground text-sm">가입한 사용자를 검색하고 관리하세요.</p>
      </div>

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
                  <AdminUserRowActions
                    userId={user.id}
                    userName={user.name}
                    isSelf={user.id === currentUserId}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AdminPagination
        page={page}
        totalPages={totalPages}
        totalLabel={`총 ${total}명`}
        ariaLabel="사용자 목록 페이지네이션"
      />
    </div>
  );
}
