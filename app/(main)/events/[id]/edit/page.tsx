export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div className="p-5">
      <h1 className="text-2xl font-bold">이벤트 수정</h1>
      <p className="text-sm text-muted-foreground">event id: {id}</p>
      {/* TODO: Task 004에서 이벤트 수정 폼 구현 */}
    </div>
  );
}
