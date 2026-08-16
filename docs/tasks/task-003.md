# Task 003: 공통 컴포넌트 라이브러리 구현

## 개요

- **목표**: Task 002에서 확정된 타입(`Event`, `EventParticipant`, `EventCardProps` 등)을 기반으로, Phase 2(Task 004~006)의 모든 페이지가 재사용할 공용 UI 컴포넌트와 더미 데이터 유틸리티를 완성한다.
- **예상 소요 시간**: 1일
- **관련 기능**: F001~F015 전체 (공용 컴포넌트 레벨 지원)
- **의존성**: Task 001 (라우팅 골격 — 완료), Task 002 (타입 정의 — 완료)

## 설계 방침

- shadcn/ui 컴포넌트는 `npx shadcn@latest add <name>`으로 설치한다 (수동 파일 생성 금지 — `components.json` 설정을 따라 자동 생성되도록).
- 도메인 컴포넌트(EventCard, ParticipantCard 등)는 `components/` 루트에 두고, Props는 이미 `lib/types/components.ts`에 정의된 것을 그대로 import해서 쓴다 (새 인터페이스를 컴포넌트 파일에 중복 정의하지 않음).
- 스켈레톤/빈 상태 컴포넌트는 `variant` prop으로 카드형·리스트형을 분기하는 범용 컴포넌트로 만든다 (`LoadingSkeletonProps.variant: "card" | "row"`를 그대로 활용).
- 더미 데이터는 `lib/mock/`에 두고 `lib/types/mock.ts`의 `MockEvent`/`MockUser` 타입을 반환 타입으로 사용한다. 실제 네트워크 호출이 없으므로 동기 함수로 작성한다.
- 다크 모드는 별도 분기 없이 Tailwind 다크 클래스(`dark:`)와 기존 `next-themes` 설정에 위임한다 — 컴포넌트 작성 시 하드코딩된 색상 대신 shadcn 테마 토큰(`bg-card`, `text-muted-foreground` 등)을 사용한다.

## 구현 사항

- [x] shadcn/ui 컴포넌트 추가 설치: `avatar`, `dialog`, `select`, `sonner`, `skeleton` (`card`는 기존에 이미 설치되어 있어 확인만 함)
  - `form`은 설치하지 않음 — `react-hook-form`/`zod`가 아직 프로젝트에 없고(CLAUDE.md 참조), Task 004에서 함께 설치하기로 확정된 항목이라 범위에서 제외
- [x] `components/event-card.tsx` — `EventCardProps` 사용, 커버 이미지·제목·날짜·장소·참여자 수·상태 배지(`EventStatus`별 `Badge` variant) 표시, `href`로 Link 이동
- [x] `components/participant-card.tsx` — `ParticipantCardProps` 사용, `Avatar` + 이름 + 역할(`host`/`participant`) 표시
- [x] `components/loading-skeleton.tsx` — `LoadingSkeletonProps` 사용, `variant="card"`(EventCard 자리) / `variant="row"`(ParticipantCard 자리) 스켈레톤을 `count`만큼 렌더링
- [x] `components/empty-state.tsx` — `EmptyStateProps` 사용, 아이콘 + title + description + 옵션 액션 버튼(`actionLabel`/`onAction`), 클릭 핸들러 때문에 클라이언트 컴포넌트
- [x] `lib/mock/events.ts` — `MockEvent[]` 더미 이벤트 목록 생성 함수 (`upcoming`/`ongoing`/`ended` 모두 포함, 6개)
- [x] `lib/mock/users.ts` — `MockUser[]` 더미 사용자 목록 생성 함수 (일반 5명 + 관리자 1명)
- [x] `lib/mock/participants.ts` — 더미 이벤트에 연결된 `EventParticipant[]` 생성 함수 (mock 이벤트/사용자 참조), 이벤트별 조회 헬퍼 포함
- [x] `lib/mock/index.ts` — barrel export
- [x] `app/layout.tsx`에 `Toaster`(sonner) 등록 — Task 013 토스트 알림에서 사용할 준비

## 수락 기준

- 기준 1: `npx shadcn@latest add`로 설치된 컴포넌트가 `components/ui/`에 추가되고, 기존 `components.json`(`new-york` 스타일) 설정을 그대로 따른다.
- 기준 2: `EventCard`, `ParticipantCard`, `LoadingSkeleton`, `EmptyState` 네 컴포넌트 모두 `lib/types/components.ts`의 기존 Props 타입을 import해서 사용하며, 별도 인터페이스를 재정의하지 않는다.
- 기준 3: 더미 데이터 유틸리티가 반환하는 값이 `Event`/`User`/`EventParticipant` 타입과 필드 단위로 정합한다 (`npm run type-check` 통과).
- 기준 4: 네 컴포넌트 모두 다크 모드에서 하드코딩 색상 없이 정상 렌더링된다 (테마 토큰만 사용).
- 기준 5: `npm run lint`, `npm run type-check`가 에러 없이 통과한다.

## 관련 파일

- /components/event-card.tsx
- /components/participant-card.tsx
- /components/loading-skeleton.tsx
- /components/empty-state.tsx
- /components/ui/avatar.tsx
- /components/ui/dialog.tsx
- /components/ui/select.tsx
- /components/ui/sonner.tsx (또는 toast 관련 파일)
- /lib/mock/events.ts
- /lib/mock/users.ts
- /lib/mock/participants.ts
- /lib/mock/index.ts
- /lib/types/components.ts (참조, 수정 없음)
- /lib/types/mock.ts (참조, 수정 없음)
