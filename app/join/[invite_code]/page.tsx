export default async function JoinPage({ params }: { params: Promise<{ invite_code: string }> }) {
  const { invite_code } = await params;

  return (
    <div className="p-5">
      <h1 className="text-2xl font-bold">초대 참여</h1>
      <p className="text-sm text-muted-foreground">invite code: {invite_code}</p>
      {/* TODO: Task 010에서 이벤트 미리보기/자동 참여 로직 구현 */}
    </div>
  );
}
