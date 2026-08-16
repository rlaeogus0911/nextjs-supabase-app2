# Task 004: 주최자 모바일 UI/UX 완성

## 개요

- **목표**: Task 001의 라우트 골격과 Task 003의 공통 컴포넌트/더미 데이터를 사용해, 주최자 관점의 모바일 페이지 6개(홈, 내 이벤트 목록, 이벤트 생성, 이벤트 상세, 이벤트 수정, 프로필)를 더미 데이터 기반으로 완성한다. 실제 API 연동은 Task 009~010에서 진행하며, 이번 Task는 UI만 완성한다.
- **예상 소요 시간**: 2일
- **관련 기능**: F001, F002, F003, F005, F006, F007, F008, F009, F011 (UI 레벨)
- **의존성**: Task 001 (라우팅 골격 — 완료), Task 003 (공통 컴포넌트 — 완료)

## 설계 방침

- 모든 페이지는 `app/(main)/layout.tsx`(모바일 프레임 + `MobileBottomNav`) 하위에서 렌더링되며, 홈(`app/page.tsx`)만 예외로 `(main)` 그룹 밖에 있다(비로그인 랜딩).
- 데이터는 전부 `lib/mock/`(Task 003)에서 가져온다. Server Component에서 동기 함수 호출로 바로 사용 — 실제 fetch/loading 상태 없음(더미이므로 `loading.tsx` 스켈레톤은 UI 시연용으로만 배치).
- 이벤트 생성/수정 폼은 **React Hook Form + Zod**로 구현한다(PRD 기준 신규 설치 라이브러리). `docs/guides/forms-react-hook-form.md`가 참고 아키텍처를 설명하지만 실제로 `app/actions/`, `lib/schemas/`, `components/forms/`, `components/ui/form.tsx`가 아직 없으므로, 이 Task에서 다음을 새로 만든다:
  - `npm install react-hook-form @hookform/resolvers zod`
  - `npx shadcn@latest add form` (Task 003에서 의도적으로 제외했던 항목)
  - `lib/schemas/event.ts` — `createEventSchema`/`updateEventSchema` (Zod), `CreateEventInput`/`UpdateEventInput`(Task 002)과 필드 정합
  - `components/forms/event-form.tsx` — 생성/수정 공용 폼 컴포넌트(모드 prop으로 분기), `Form`/`FormField` 등 shadcn 패턴 사용
- 폼 제출은 이번 Task에서는 실제 저장을 하지 않는다 — `onSubmit`에서 `console.log` 또는 `sonner`의 `toast.success(...)`로 "생성/수정되었습니다" 표시 후 상세/목록 페이지로 `router.push`만 수행(진짜 mutation은 Task 009).
- 커버 이미지 업로드(F009)는 이번 Task에서는 파일 선택 UI(input[type=file] + 미리보기)까지만 구현하고, 실제 Supabase Storage 업로드는 Task 009에서 연결한다.
- 초대 링크 공유(F003)는 카카오톡 SDK 연동 없이, 우선 "클립보드 복사" 버튼(`navigator.clipboard.writeText`)만 동작하는 것으로 구현하고 카카오톡 공유 버튼은 UI만 배치(`disabled` 또는 클릭 시 toast "준비 중").
- 이벤트 삭제(F006)는 `Dialog`로 확인 모달을 띄우고, 확인 시 목업 상태에서 목록으로 이동하는 것까지만 구현(실제 삭제 API는 Task 009).
- 상태별 필터(F008)는 클라이언트 컴포넌트에서 `useState`로 `EventStatus | "all"`을 관리하고 mock 목록을 필터링.

## 구현 사항

- [x] `app/page.tsx` — 랜딩 페이지 UI 완성 (F001)
  - 서비스 소개 히어로 섹션, 3가지 핵심 기능 카드(간편 생성/초대 공유/실시간 참여자)
  - 기존 "Google로 시작하기" 로그인 흐름은 `AuthButton`을 그대로 활용(상단 nav), 하단 중복 CTA는 제거
- [x] `app/(main)/events/page.tsx` — 내 이벤트 목록 페이지 (F007, F008)
  - `getMockEvents()`로 목록 조회, `EventCard` 그리드 렌더링
  - 상태별 필터 탭(`전체/예정/진행 중/종료`) — 클라이언트 컴포넌트로 분리(`components/event-status-filter.tsx`)
  - 목록이 없을 때 `EmptyState` 사용
  - "+ 새 이벤트 만들기" FAB 버튼 (`(main)/layout.tsx`의 `relative` 프레임 기준 `absolute` 배치로 모바일 프레임 내 고정)
- [x] `app/(main)/events/loading.tsx` — `LoadingSkeleton variant="card"` 사용
- [x] `lib/schemas/event.ts` — Zod 스키마 (title 필수/50자, description 선택/500자, location 필수/100자, eventDate 필수)
- [x] `components/forms/event-form.tsx` — React Hook Form 기반 생성/수정 공용 폼 (커버 이미지 파일 입력 + 미리보기 포함)
- [x] `app/(main)/events/new/page.tsx` — 이벤트 생성 페이지 (F001, F009), `EventForm mode="create"` 렌더링
- [x] `app/(main)/events/[id]/page.tsx` — 이벤트 상세 페이지 - 주최자 뷰 (F002, F003, F005, F006, F008, F009)
  - `getMockEvents()`에서 id로 조회 (없으면 `notFound()`)
  - 커버 이미지, 제목/날짜/장소/설명, 상태 배지
  - 초대 링크 표시 + 복사 버튼(클립보드, `components/event-invite-link.tsx`) + 카카오톡 공유 버튼(toast "준비 중")
  - `getMockParticipantsByEventId(id)`로 참여자 목록을 `ParticipantCard`로 렌더링, 없으면 `EmptyState`
  - 주최자 전용 액션: "이벤트 수정" 링크, "이벤트 삭제" 버튼(`components/event-delete-dialog.tsx`, `Dialog` 확인)
- [x] `app/(main)/events/[id]/edit/page.tsx` — 이벤트 수정 페이지 (F006, F009), `EventForm mode="edit"`에 기존 값 주입
- [x] `app/(main)/profile/page.tsx` — 주최자 프로필 페이지 (F011)
  - 아바타, 이름, 이메일(읽기 전용), 가입일 표시 — 실제 로그인 사용자 데이터는 Task 008에서 연동 예정이라 목업 사용자(`getMockUsers()[0]`)로 표시
  - "로그아웃" 버튼 (기존 `LogoutButton` 컴포넌트 재사용, 실제 Supabase 세션 종료)
- [x] 반응형 + 다크 모드 점검: 하드코딩 색상 없이 테마 토큰만 사용 확인 (코드 리뷰 + 홈페이지 Playwright 스크린샷)
- [~] `components/layout/mobile-bottom-nav.tsx` FAB 스타일 보완 — 선택 사항으로 남겨두고 이번 Task에서는 스킵(목록 페이지 자체 FAB로 충분하다고 판단)

## 수락 기준

- 기준 1: `/`, `/events`, `/events/new`, `/events/[id]`, `/events/[id]/edit`, `/profile` 6개 페이지가 목업 데이터로 완전히 렌더링되고 콘솔 에러가 없다. (`/`는 Playwright로 직접 확인, 나머지 5개는 `proxy.ts`의 인증 가드로 실제 로그인 세션 없이는 접근 불가 — 아래 "알려진 제약" 참고)
- 기준 2: `/events`에서 상태 필터 탭 클릭 시 목록이 올바르게 필터링된다. (코드 리뷰로 로직 확인, 실기 클릭 테스트는 인증 필요)
- 기준 3: 이벤트 생성/수정 폼에서 필수 필드를 비우고 제출하면 Zod 유효성 검사 에러 메시지가 표시된다. (스키마/폼 연결 코드 리뷰로 확인)
- 기준 4: 이벤트 상세 페이지에서 초대 링크 "복사" 버튼 클릭 시 클립보드에 복사되고 `toast`로 성공 피드백이 뜬다. (코드 리뷰로 확인)
- 기준 5: 이벤트 삭제 버튼 클릭 시 확인 `Dialog`가 뜨고, 확인 시 목록 페이지로 이동한다. (코드 리뷰로 확인)
- 기준 6: `npm run type-check`, `npm run lint`가 에러 없이 통과한다. — ✅ 확인 완료
- 기준 7: 모바일 뷰포트(375px 기준)와 다크 모드에서 레이아웃 깨짐이 없다. — 홈페이지는 Playwright 스크린샷으로 확인 완료, 인증 필요 페이지는 하드코딩 색상 없이 테마 토큰만 사용했음을 코드 리뷰로 확인.

### ⚠️ 알려진 제약: 인증 가드로 인한 실기 테스트 한계

`proxy.ts`가 `/`, `/login`, `/auth/*`를 제외한 모든 경로에서 미인증 사용자를 `/auth/login`으로 리다이렉트한다(CLAUDE.md 명시 동작). 이 샌드박스에는 실제 Google OAuth 로그인 세션이 없어 `/events`, `/events/new`, `/events/[id]`, `/events/[id]/edit`, `/profile`을 Playwright로 직접 접속·조작하는 실기 테스트는 수행하지 못했다. `npm run dev` + `curl`로 307 리다이렉트를 확인해 가드가 의도대로 동작함은 검증했고, 나머지는 타입체크·린트 통과와 코드 리뷰로 로직을 검증했다. **실제 로그인 세션이 확보되면(Task 008 이후, 또는 테스트 계정 제공 시) 아래 테스트 체크리스트를 재실행해야 한다.**

## 테스트 체크리스트

> 이번 Task는 UI 전용이라 실제 API/DB 연동은 없지만, 폼 유효성 검사와 클라이언트 상호작용(필터, 모달, 클립보드)이 포함되므로 Playwright MCP로 검증한다. 위 제약으로 인해 아래 항목은 로그인 세션 확보 후 재실행 필요(미완료로 표시).

- [ ] `/events` 접속 → 목업 이벤트 카드 6개가 렌더링되는지 확인
- [ ] 상태 필터 탭("예정"/"진행 중"/"종료") 클릭 시 카드 목록이 올바르게 줄어드는지 확인
- [ ] "+ 새 이벤트 만들기" → `/events/new` 이동 확인
- [ ] `/events/new`에서 빈 값으로 제출 → 필드별 에러 메시지 노출 확인
- [ ] `/events/new`에서 정상 값 입력 후 제출 → toast 성공 메시지 + 리다이렉트 확인
- [ ] `/events/[id]` 접속 → 참여자 목록, 초대 링크, 상태 배지 렌더링 확인
- [ ] 초대 링크 "복사" 버튼 클릭 → toast 성공 메시지 확인
- [ ] "이벤트 삭제" 버튼 클릭 → 확인 Dialog 노출 → 확인 클릭 시 목록으로 리다이렉트 확인
- [ ] `/events/[id]/edit` 접속 → 기존 값이 폼에 미리 채워지는지 확인
- [ ] 존재하지 않는 이벤트 id로 `/events/[id]` 접속 → 404(`not-found`) 처리 확인
- [ ] 다크 모드 토글 후 6개 페이지 모두 육안 확인 (Playwright 스크린샷)
- [x] `/` 접속 → 랜딩 페이지 렌더링, 콘솔 에러 없음 확인 (Playwright, 375px 뷰포트)

## 관련 파일

- /app/page.tsx
- /app/(main)/events/page.tsx
- /app/(main)/events/loading.tsx
- /app/(main)/events/new/page.tsx
- /app/(main)/events/[id]/page.tsx
- /app/(main)/events/[id]/edit/page.tsx
- /app/(main)/profile/page.tsx
- /components/forms/event-form.tsx
- /components/event-status-filter.tsx
- /lib/schemas/event.ts
- /components/ui/form.tsx (신규 설치)
- /lib/mock/events.ts, /lib/mock/participants.ts (참조, 수정 없음)
- /lib/types/components.ts, /lib/types/event.ts (참조, 수정 없음)
