# Task 005: 참여자 모바일 UI/UX 완성

## 개요

- **목표**: Task 004에서 완성한 주최자 뷰를 확장해, 동일한 라우트(`/events`, `/events/[id]`, `/profile`)에서 뷰어의 역할(주최자/참여자)에 따라 다르게 렌더링되는 참여자 경험을 완성하고, 초대 링크 참여 페이지(`/join/[invite_code]`) UI를 구현한다.
- **예상 소요 시간**: 1일
- **관련 기능**: F004, F005, F007, F011 (UI 레벨)
- **의존성**: Task 004 (공통 컴포넌트/페이지 재사용)

## 설계 방침 (라우트 분리 대신 역할 기반 조건부 렌더링)

- Next.js App Router에서 `(main)`과 별도 라우트 그룹을 만들어도 URL 세그먼트(`/events`, `/events/[id]`, `/profile`)가 동일하면 빌드 시 라우트 충돌이 난다. 따라서 별도의 참여자 전용 라우트 그룹을 만들지 않고, **기존 라우트에서 뷰어의 역할을 계산해 조건부로 렌더링**하는 방식을 택했다.
- 목업 단계에서 "로그인한 사용자"를 고정 ID(`MOCK_CURRENT_USER_ID = "user-1"`, `lib/mock/users.ts`)로 취급한다. 이 사용자는 `event-1`의 주최자, `event-2`/`event-5`의 참여자로 목업 데이터(`lib/mock/participants.ts`)에 등록되어 있어 주최자/참여자 뷰를 한 계정으로 모두 시연할 수 있다.
- `lib/mock/my-events.ts`의 `getMockMyEvents()`가 현재 사용자가 속한(주최 또는 참여) 이벤트와 역할(`ParticipantRole`)을 함께 반환한다. `/events` 목록은 이제 전체 이벤트가 아니라 이 목록을 사용한다(F007 요구사항에 맞게 Task 004의 "전체 이벤트 표시"에서 수정됨).
- **하단 내비게이션 바("새 이벤트" 버튼)는 이번 Task에서 역할별로 분리하지 않았다.** 실제 서비스에서는 한 사용자가 어떤 이벤트에서는 주최자, 다른 이벤트에서는 참여자일 수 있어 "생성 버튼 없는 참여자 전용 내비게이션"을 전역으로 고정하는 것이 비현실적이라 판단했다. 대신 `/events/[id]` 상세 페이지에서 해당 이벤트에 대한 뷰어의 역할에 따라 수정/삭제 버튼 노출 여부를 결정하는 페이지 단위 권한 제어로 구현했다.
- 참여자 뷰 상세 페이지: 읽기 전용 이벤트 정보, 다른 참여자 목록(수정 불가, 기존 `ParticipantCard` 재사용), 초대 링크는 "복사"만 제공하고 카카오톡 공유 버튼은 숨김(`EventInviteLink`의 `shareOnly` prop), 수정/삭제 버튼 대신 "참여자로 참여 중" 배지 표시.

## 구현 사항

- [x] `lib/mock/users.ts` — `MOCK_CURRENT_USER_ID`, `getMockCurrentUser()` 추가
- [x] `lib/mock/participants.ts` — user-1을 event-2/event-5의 참여자로 추가 등록, `getMockMyParticipation(eventId, userId)` 헬퍼 추가
- [x] `lib/mock/my-events.ts` — `getMockMyEvents()`: 현재 사용자가 속한 이벤트+역할 목록 반환 (F007)
- [x] `lib/types/components.ts` — `EventCardProps`에 선택적 `role` 필드 추가
- [x] `components/event-card.tsx` — 역할 배지(주최자/참여자) 표시
- [x] `components/event-status-filter.tsx` — `Event[]` 대신 `MyEvent[]`(`{event, role}`) 기반으로 필터링하도록 리팩터링
- [x] `app/(main)/events/page.tsx` — `getMockMyEvents()` 사용으로 변경 (F007)
- [x] `components/event-invite-link.tsx` — `shareOnly` prop 추가(참여자 뷰에서 카카오톡 공유 버튼 숨김)
- [x] `app/(main)/events/[id]/page.tsx` — 뷰어 역할(`isHost`) 계산 후 조건부 렌더링 (F005)
  - 주최자: 기존과 동일(수정/삭제 버튼, 전체 공유 옵션)
  - 참여자: 읽기 전용 정보, 참여자 목록 열람만 가능, 초대 링크는 복사만, "참여자로 참여 중" 배지
- [x] `app/(main)/profile/page.tsx` — `getMockCurrentUser()` 사용, 주최/참여 이벤트 수 통계 카드 추가 (F011)
- [x] `components/join-confirm-button.tsx` — 참여 확인 버튼(클라이언트, `toast` + `router.push`로 상세 페이지 이동, 실제 참여 API는 Task 010)
- [x] `app/join/[invite_code]/page.tsx` — 초대 코드로 이벤트 조회 후 미리보기(커버/제목/설명/날짜/장소/참여자 수) + 참여 확인 버튼 (F004), 유효하지 않은 코드는 `EmptyState`로 안내

## 수락 기준

- 기준 1: `/events`가 "내가 참여한/만든" 이벤트만(현재 목업 사용자 기준 3건) 역할 배지와 함께 렌더링한다. (코드 리뷰로 확인 — 인증 가드로 실기 테스트 미완료, 아래 알려진 제약 참고)
- 기준 2: `/events/[id]`에서 뷰어가 참여자인 이벤트(`event-2`, `event-5`)는 수정/삭제 버튼이 보이지 않고 "참여자로 참여 중" 배지가 표시된다. (코드 리뷰로 확인)
- 기준 3: `/events/[id]`에서 뷰어가 주최자인 이벤트(`event-1`)는 Task 004와 동일하게 수정/삭제 버튼과 카카오톡 공유 버튼이 보인다. (코드 리뷰로 확인)
- 기준 4: `/join/[invite_code]`에 유효한 초대 코드(예: `SUMMER26`)로 접속 시 이벤트 미리보기와 "참여하기" 버튼이 렌더링된다. (코드 리뷰로 확인)
- 기준 5: `/join/[invite_code]`에 존재하지 않는 초대 코드로 접속 시 `EmptyState`로 안내 문구가 표시된다. (코드 리뷰로 확인)
- 기준 6: "참여하기" 버튼 클릭 시 toast 성공 메시지가 뜨고 해당 이벤트 상세 페이지로 이동한다. (코드 리뷰로 확인)
- 기준 7: `npm run type-check`, `npm run lint`가 에러 없이 통과한다. — ✅ 확인 완료
- 기준 8: 반응형/다크 모드에서 레이아웃 깨짐 없음 (테마 토큰만 사용, 하드코딩 색상 없음을 코드 리뷰로 확인).

### ⚠️ 알려진 제약: 인증 가드로 인한 실기 테스트 한계

Task 004와 동일하게 `proxy.ts`가 `/`, `/login`, `/auth/*`를 제외한 모든 경로(`/events`, `/events/[id]`, `/profile`, `/join/[invite_code]` 포함)에서 미인증 사용자를 `/auth/login`으로 리다이렉트한다. 이 샌드박스에는 실 로그인 세션이 없어 Playwright MCP로 위 페이지들을 직접 접속·조작하는 실기 테스트를 수행하지 못했다. 타입체크·린트 통과와 코드 리뷰로 로직을 검증했다. **실제 로그인 세션이 확보되면(Task 008 이후) 아래 테스트 체크리스트를 재실행해야 한다.**

## 테스트 체크리스트

> UI 전용 Task이지만 역할 기반 조건부 렌더링과 클라이언트 상호작용(참여 확인, 복사)이 있으므로 Playwright MCP로 검증한다. 위 제약으로 로그인 세션 확보 후 재실행 필요(미완료로 표시).

- [ ] `/events` 접속 → 역할 배지가 포함된 이벤트 카드 3개(주최 1 + 참여 2) 렌더링 확인
- [ ] `/events/event-1`(주최자) 접속 → 수정/삭제 버튼, 카카오톡 공유 버튼 노출 확인
- [ ] `/events/event-2`(참여자) 접속 → 수정/삭제 버튼 없음, "참여자로 참여 중" 배지, 카카오톡 공유 버튼 숨김 확인
- [ ] `/join/SUMMER26` 접속 → 이벤트 미리보기 렌더링 확인
- [ ] `/join/INVALID` 접속 → "유효하지 않은 초대 링크입니다" 안내 확인
- [ ] "참여하기" 버튼 클릭 → toast 메시지 + `/events/[id]`로 리다이렉트 확인
- [ ] `/profile` 접속 → 주최/참여 이벤트 수 통계 카드 렌더링 확인
- [ ] 다크 모드 토글 후 4개 페이지(`/events`, `/events/[id]` 참여자뷰, `/join/[invite_code]`, `/profile`) 육안 확인 (Playwright 스크린샷)

## 관련 파일

- /app/join/[invite_code]/page.tsx
- /app/(main)/events/page.tsx
- /app/(main)/events/[id]/page.tsx
- /app/(main)/profile/page.tsx
- /components/join-confirm-button.tsx
- /components/event-card.tsx
- /components/event-status-filter.tsx
- /components/event-invite-link.tsx
- /lib/mock/users.ts
- /lib/mock/participants.ts
- /lib/mock/my-events.ts
- /lib/mock/index.ts
- /lib/types/components.ts
