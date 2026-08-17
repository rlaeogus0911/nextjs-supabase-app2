/**
 * 외부 패키지(nanoid 등) 의존성 없이 crypto.randomUUID() 기반으로
 * 8자리 초대 코드를 생성한다. (F002)
 */
export function generateInviteCode(): string {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 8);
}
