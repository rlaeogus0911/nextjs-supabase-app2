import { AdminPagination } from "@/components/admin/admin-pagination";
import { EventsToolbar } from "@/components/admin/events-toolbar";
import { RowActionButton } from "@/components/admin/row-action-button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getMockAdminEventRows } from "@/lib/mock";
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

export default function AdminEventsPage() {
  const events = getMockAdminEventRows();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">이벤트 관리</h1>
        <p className="text-sm text-muted-foreground">등록된 이벤트를 검색하고 관리하세요.</p>
      </div>

      {/* 검색 및 필터 영역 - 동작은 구현되지 않은 정적 마크업 */}
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
                  <RowActionButton ariaLabel={`${event.title} 더보기`} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* 페이지네이션 - 동작 없는 정적 마크업 */}
      <AdminPagination
        totalLabel={`총 ${events.length}개 이벤트`}
        ariaLabel="이벤트 목록 페이지네이션"
      />
    </div>
  );
}
