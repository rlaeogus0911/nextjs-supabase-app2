export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div className="p-5">
      <h1 className="text-2xl font-bold">이벤트 상세</h1>
      <p className="text-sm text-muted-foreground">event id: {id}</p>
      {/* TODO: Task 004/005에서 이벤트 상세 정보/참여자 목록 구현 */}
    </div>
  );
}
