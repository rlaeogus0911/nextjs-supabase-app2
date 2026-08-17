# Task 010: 참여자 관리 ✅ 완료

## 개요

- **목표**: 초대 링크 참여 플로우(`app/join/[invite_code]`)의 `lib/mock/*` 데이터를 실제 Supabase 연동으로 교체하고, 중복 참여 방지·역할(role) 판별·참여자 수 실시간 갱신을 구현
- **관련 기능**: F004, F007
- **의존성**: Task 007(DB 스키마·타입), Task 008(인증 시스템), Task 009(이벤트 CRUD·초대 코드 생성)

## 사전 조사

- `mcp__supabase__list_tables(verbose)` + `execute_sql`로 `event_participants` 제약을 재확인한 결과, `(event_id, user_id)` UNIQUE 제약(`event_participants_event_id_user_id_key`)이 Task 007에서 이미 선반영되어 있었음(설계 문서에는 명시되지 않았던 사실). 신규로 추가했던 중복 제약(`event_participants_event_user_unique`)은 확인 후 제거.
- `pg_publication_tables`로 `event_participants`가 `supabase_realtime` publication에 이미 포함되어 있음을 확인 — Realtime 채널 구독을 위한 별도 마이그레이션 불필요.
- `lib/api/events.ts`의 `createEvent`가 이벤트 생성 시 `event_participants`에 `role: "host"` row를 이미 함께 등록하고 있어, `getEvents`가 이 role을 함께 조회하도록 확장하면 Task 009에서 남겨둔 `createdBy` 비교 임시 로직을 정확한 role 기반으로 교체 가능함을 확인.
- `lib/mappers.ts`의 `toEventParticipant`, `lib/types/participant.ts`의 `ParticipantRole` 타입은 이미 정의되어 있어 재사용.

## 구현 사항

- [x] Supabase 마이그레이션: `event_participants` UNIQUE(event_id, user_id) 제약 존재 확인(신규 추가 불필요, 중복 시도분 제거)
- [x] `lib/api/events.ts`: `getEvents` 반환 타입을 `{ event: Event; role: ParticipantRole }[]`로 확장(참여자 role을 함께 조회), `getEventByInviteCode` 신규 추가(F004)
- [x] `lib/api/participants.ts` 신설: `getMyParticipation`(중복 참여 여부 확인), `joinEvent`(참여 등록, `23505` unique violation을 "이미 참여한 이벤트입니다" 메시지로 매핑)
- [x] `app/join/[invite_code]/page.tsx`: `getMockEvents()` 제거 → `getEventByInviteCode` 실조회, 로그인 사용자의 기존 참여 여부를 `getMyParticipation`으로 확인해 `alreadyJoined`를 `JoinConfirmButton`에 전달
- [x] `components/join-confirm-button.tsx`: 토스트만 띄우던 목업 로직 제거 → 브라우저 Supabase 클라이언트로 `joinEvent` 실호출, `alreadyJoined`면 "이벤트로 이동" 버튼으로 대체
- [x] `app/(main)/events/page.tsx`: `createdBy` 비교 임시 role 로직 제거, `getEvents`가 반환하는 실제 role 사용
- [x] `components/participant-count-realtime.tsx` 신설: Supabase Realtime(`postgres_changes`, `event_participants`, `event_id` 필터)으로 INSERT/DELETE 구독, 참여자 수를 즉시 증감 표시하고 `router.refresh()`로 목록 동기화
- [x] `app/(main)/events/[id]/page.tsx`: 참여자 수 텍스트를 `ParticipantCountRealtime`으로 교체

## 수락 기준

- 기준 1: 유효한 초대 코드로 `/join/[code]` 접근 시 실제 DB 이벤트 정보(제목/날짜/장소/참여자 수)가 표시됨 — 코드 구현 완료, 로그인 세션 필요로 접근 자체는 수동 검증 권장(아래 참고)
- 기준 2: 유효하지 않은 초대 코드는 `EmptyState`가 표시됨 — 코드 구현 완료(`getEventByInviteCode`가 `null` 반환 시 기존 분기 유지)
- 기준 3: 로그인 사용자가 참여하기를 누르면 `event_participants`에 row가 생성되고, 이미 참여한 사용자는 DB 제약(`23505`) + 애플리케이션 레벨 안내로 중복 참여가 방지됨 — 코드 구현 완료, 수동 검증 권장
- 기준 4: `/events` 목록에서 주최한 이벤트는 host, 참여만 한 이벤트는 participant로 정확히 표시됨(`createdBy` 비교 제거) — 코드 구현 완료, 수동 검증 권장
- 기준 5: 이벤트 상세 페이지에서 참여자 수가 다른 사용자의 참여/탈퇴 시 실시간으로 갱신됨 — 코드 구현 완료, 두 세션 동시 접속 수동 검증 권장
- 기준 6: `npm run type-check`, `npm run lint` 통과 — **충족** (아래 검증 로그 참고)

## 테스트 체크리스트

### 정적 검증

- `npm run type-check` → 에러 없음
- `npm run lint` → 에러/경고 없음 (`participant-count-realtime.tsx`의 `setState in effect` 경고를 초기 동기화 effect 제거로 해소)

### Supabase 상태 검증

- `event_participants` 제약: `event_participants_event_id_user_id_key` UNIQUE(event_id, user_id) 존재 확인(`pg_constraint` 조회)
- `event_participants`가 `supabase_realtime` publication에 포함되어 있음을 `pg_publication_tables` 조회로 확인
- `get_advisors(security)`: 기존에 있던 `auth_leaked_password_protection` 경고 외 신규 이슈 없음(이번 작업과 무관)

### Playwright MCP E2E

- [x] `/join/[유효한 invite_code]` 접근 시 `proxy.ts` 인증 가드에 의해 `/auth/login`으로 리다이렉트되는 것을 확인(기존 인증 가드가 초대 링크 경로에도 동일하게 적용됨을 재확인)
- [ ] ~~유효한 초대 코드 접근 시 이벤트 정보 표시~~ **자동화 불가**(로그인 필요)
- [ ] ~~참여하기 클릭 → `event_participants` row 생성 → 이벤트 상세 이동~~ **자동화 불가**
- [ ] ~~이미 참여한 사용자의 중복 참여 방지 UX~~ **자동화 불가**
- [ ] ~~두 세션에서 참여자 수 실시간 갱신~~ **자동화 불가**

### ⚠️ 알려진 제약 1: `/join/[invite_code]`도 인증 가드 대상

`proxy.ts`가 `/`, `/login`, `/auth/*`, `/admin/login`을 제외한 모든 경로에서 미인증 사용자를 `/auth/login`으로 리다이렉트하며, 이는 `/join/[invite_code]`에도 그대로 적용된다. 초대 링크를 받은 비로그인 사용자가 이벤트 미리보기를 먼저 보고 로그인할지 결정하게 하려면(F004 의도상 자연스러운 흐름) `/join`을 인증 가드 예외 경로에 추가하는 것이 더 적합할 수 있으나, 이는 인증 아키텍처(Task 008 소관) 변경이라 이번 Task 010 범위에서는 손대지 않았다. **후속 검토 필요 항목으로 기록.**

### ⚠️ 알려진 제약 2: 실 로그인 세션 필요 플로우 미검증

Task 004~009와 동일한 이유로 Google OAuth 동의 화면을 Playwright MCP로 자동화할 수 없어, 로그인 완료 이후에만 접근 가능한 다음 플로우는 실제 브라우저로 검증하지 못했다:

- 초대 코드로 이벤트 정보 조회 및 참여 처리
- 중복 참여 방지 안내 UX
- `/events` 목록의 host/participant role 정확도
- 참여자 수 Realtime 갱신(두 세션 동시 접속 필요)

대신 다음으로 대체 검증했다: (1) 전체 로직은 코드 리뷰 + `npm run type-check`/`npm run lint` 통과로 정적 검증, (2) `mcp__supabase__execute_sql`/`list_tables`로 UNIQUE 제약과 Realtime publication 설정이 구현 코드와 일치함을 확인, (3) 미인증 리다이렉트만 Playwright로 재확인.

**수동 검증 권장**: `rlaeogus0911@gmail.com` 계정과 별도 테스트 계정으로 초대 링크 참여 → 중복 참여 시도 → `/events` role 표시 → 두 세션에서 참여자 수 실시간 갱신을 1회 수동으로 확인할 것.

### 수동 검증 중 발견 및 수정된 버그 (2026-08-17)

실제 두 계정(A: 주최자, B: 참여자)으로 수동 검증을 진행하는 과정에서 Next.js 16 `cacheComponents`(dynamicIO) 관련 `Blocking Route` 렌더링 차단 에러 2건을 발견해 수정함:

1. **`/join/[invite_code]` 렌더링 차단**: `getEventByInviteCode` 호출이 `<Suspense>` 경계 없이 라우트에서 직접 실행되어 페이지 자체가 렌더링되지 않음(계정 B에서 재현). `app/(main)/events/loading.tsx`처럼 `loading.tsx`가 있으면 Next.js가 암묵적 Suspense로 감싸주지만 `app/join/[invite_code]/`에는 `loading.tsx`가 없었던 것이 원인. → `app/join/[invite_code]/loading.tsx` 신규 생성으로 해결.
2. **`app/(main)/layout.tsx` 렌더링 차단**: 레이아웃 자체의 `await supabase.auth.getClaims()`가 Suspense 밖에서 실행되어 `/events`, `/events/[id]` 등 `(main)` 그룹 전체가 차단됨(계정 A에서 재현). 1차 수정으로 `getClaims()`+redirect 로직을 `AuthGuard` 서브 컴포넌트로 분리해 `<Suspense>`로 감쌌으나, `<MobileBottomNav />`(`usePathname()`을 쓰는 Client Component)를 Suspense 밖에 남겨두어 동일 에러가 계정 B에서 재발함. → `<MobileBottomNav />`도 별도 `<Suspense>`로 감싸 최종 해결. `app/(main)/layout.tsx`는 Task 008 산출물이지만 Task 010 수동 검증이 이 파일에 막혀 있었기 때문에 함께 수정함.

두 계정 모두 `/events`, `/events/[id]`, `/join/[invite_code]` 정상 렌더링을 재확인함(`npm run type-check`/`npm run lint` 통과 포함). `app/admin/(dashboard)/layout.tsx`에도 동일 패턴이 있을 가능성이 있으나 이번 보고 범위가 아니라 미확인 상태로 남김(필요 시 별도 확인 필요).

### 수동 검증 완료 (2026-08-17)

위 버그 수정 이후 계정 A(주최자)·계정 B(참여자) 두 계정으로 전체 6단계를 실제로 수행해 모두 정상 동작을 확인함:

1. 이벤트 생성 시 계정 A가 `event_participants`에 host로 자동 등록됨 — 정상
2. 계정 B가 초대 링크(`/join/[invite_code]`)로 유효한 이벤트 정보(제목/날짜/장소/참여자 수)를 정상 조회함 — 정상
3. 계정 B가 "참여하기"로 정상 참여 처리됨(`/events/[id]`로 이동) — 정상
4. 계정 B가 같은 초대 링크에 재접근 시 "이벤트로 이동" 버튼으로 전환되어 중복 참여가 방지됨 — 정상
5. `/events` 목록에서 계정 A는 host, 계정 B는 participant로 정확히 표시됨 — 정상
6. 계정 A의 이벤트 상세 화면에서 참여자 수가 새로고침 없이 실시간으로 갱신됨 — 정상

이로써 수락 기준 1~5 전부 실제 브라우저 환경에서 검증 완료. "알려진 제약 2"의 수동 검증 권장 항목은 모두 충족됨.

## 관련 파일

- F:\claude\nextjs-supabase-app2\lib\api\events.ts
- F:\claude\nextjs-supabase-app2\lib\api\participants.ts
- F:\claude\nextjs-supabase-app2\app\join\[invite_code]\page.tsx
- F:\claude\nextjs-supabase-app2\app\join\[invite_code]\loading.tsx
- F:\claude\nextjs-supabase-app2\components\join-confirm-button.tsx
- F:\claude\nextjs-supabase-app2\components\participant-count-realtime.tsx
- F:\claude\nextjs-supabase-app2\app\(main)\events\page.tsx
- F:\claude\nextjs-supabase-app2\app\(main)\events\[id]\page.tsx
- F:\claude\nextjs-supabase-app2\app\(main)\layout.tsx
