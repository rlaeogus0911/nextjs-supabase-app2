import { AdminEventRowActions } from "@/components/admin/admin-event-row-actions";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { EventsToolbar } from "@/components/admin/events-toolbar";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAdminEventRows } from "@/lib/api/admin";
import { createClient } from "@/lib/supabase/server";
import type { EventStatus } from "@/lib/types/event";

const STATUS_LABEL: Record<EventStatus, string> = {
  upcoming: "예정",
  ongoing: "진행 중",
  ended: "종료",
};

const STATUS_VARIANT: Record<EventStatus, "default" | "secondary" | "outline"> = {
  upcoming: "outline",
  ongoing: "default",
  ended: "secondary",
};

const PAGE_SIZE = 20;

interface AdminEventsPageProps {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}

export default async function AdminEventsPage({ searchParams }: AdminEventsPageProps) {
  const { q, status, page: pageParam } = await searchParams;
  const page = Number(pageParam) || 1;

  const supabase = await createClient();
  const { rows: events, total } = await getAdminEventRows(supabase, {
    search: q,
    status: status as EventStatus | undefined,
    page,
    pageSize: PAGE_SIZE,
  });

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">이벤트 관리</h1>
        <p className="text-muted-foreground text-sm">등록된 이벤트를 검색하고 관리하세요.</p>
      </div>

      <EventsToolbar />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>제목</TableHead>
              <TableHead>주최자</TableHead>
              <TableHead>일시</TableHead>
              <TableHead className="text-right">참여자 수</TableHead>
              <TableHead>상태</TableHead>
              <TableHead>생성일</TableHead>
              <TableHead className="text-right">
                <span className="sr-only">액션</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.map((event) => (
              <TableRow key={event.id}>
                <TableCell className="font-medium">{event.title}</TableCell>
                <TableCell>{event.hostName}</TableCell>
                <TableCell>{new Date(event.eventDate).toLocaleDateString("ko-KR")}</TableCell>
                <TableCell className="text-right">{event.participantCount}</TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[event.status]}>{STATUS_LABEL[event.status]}</Badge>
                </TableCell>
                <TableCell>{new Date(event.createdAt).toLocaleDateString("ko-KR")}</TableCell>
                <TableCell className="text-right">
                  <AdminEventRowActions eventId={event.id} eventTitle={event.title} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AdminPagination
        page={page}
        totalPages={totalPages}
        totalLabel={`총 ${total}개 이벤트`}
        ariaLabel="이벤트 목록 페이지네이션"
      />
    </div>
  );
}
