# Task 011: 관리자 대시보드 백엔드 구현 ✅ 완료

## 개요

- **목표**: `app/admin/(dashboard)/**` 4개 페이지(대시보드/이벤트 관리/사용자 관리/통계 분석)의 `lib/mock/admin.ts` 더미 데이터를 실제 Supabase(profiles/events/event_participants) 연동으로 교체. 검색/필터/정렬/페이지네이션, 이벤트/사용자 삭제 API, 대시보드 지표 집계, 기간별 통계 그래프 데이터 API 구현
- **관련 기능**: F012(대시보드 지표), F013(이벤트 관리 테이블), F014(사용자 관리 테이블), F015(통계 분석)
- **의존성**: Task 007(DB 스키마·타입), Task 008(인증/관리자 role 체크), Task 009(이벤트 CRUD), Task 010(참여자 관리)

## 사전 조사

- `mcp__supabase__list_tables(verbose)`로 RLS 정책 확인 결과, `events_delete_own`(created_by=auth.uid()만)만 존재하고 `profiles`에는 DELETE 정책 자체가 없었음 — 관리자가 타인의 이벤트/사용자를 삭제하려면 admin 전용 RLS 정책 추가가 필요했음.
- `events.created_by → profiles.id` FK 제약명은 `events_created_by_fkey` — `getAdminEventRows`의 PostgREST 조인(`profiles!events_created_by_fkey(...)`)에 그대로 사용.
- 코드베이스 전체에 Server Action(`"use server"`) 사례가 전무하고, 기존 CRUD(`components/join-confirm-button.tsx` 등)가 모두 Client Component에서 `lib/supabase/client.ts` 브라우저 클라이언트로 `lib/api/*` 함수를 직접 호출하는 패턴이라 관리자 삭제 기능도 동일 패턴을 따름(새 아키텍처 도입 안 함).
- `profiles` 삭제는 `auth.users`까지 완전히 지울 수 없음(anon/publishable key만 사용, service role key 미도입) — 사용자와 협의해 **profiles row만 삭제**하는 범위로 확정(auth.users는 잔존).
- PostgREST는 SQL `GROUP BY`를 지원하지 않아 통계 시계열(`getEventTimeSeries`/`getUserTimeSeries`)은 전체 row를 가져와 서버 컴포넌트에서 JS로 날짜별 집계하는 방식으로 구현(현재 DB 규모가 수 row 수준이라 적절).

## 구현 사항

- [x] Supabase 마이그레이션(`admin_delete_policies`): `events_delete_admin`(관리자는 모든 이벤트 삭제 가능), `profiles_delete_admin`(관리자는 자기 자신 제외 모든 사용자 삭제 가능, `id != auth.uid()` 조건 포함) RLS 정책 추가
- [x] `lib/api/admin.ts` 신설: `getDashboardMetrics`(오늘/이번 주/이번 달/전체 이벤트, 오늘/이번 주/전체 가입자 count 집계), `getAdminEventRows`(검색/상태 필터/페이지네이션, host 이름 조인, 참여자 수 집계), `getAdminUserRows`(검색/역할 필터/페이지네이션, 생성한/참여한 이벤트 수 집계, N+1 방지를 위해 현재 페이지 user id 범위로만 집계), `deleteEventAsAdmin`, `deleteUserAsAdmin`, `getEventTimeSeries`, `getUserTimeSeries`, `getEventStatusDistribution`
- [x] `lib/types/admin.ts`: "임시 타입" 주석 제거(실사용 타입으로 전환), `PaginatedResult<T>`, `AdminEventFilters`, `AdminUserFilters` 타입 추가
- [x] `app/admin/(dashboard)/dashboard/page.tsx`: async Server Component 전환, `getDashboardMetrics` 실호출 + `dashboard/loading.tsx` 신설
- [x] `app/admin/(dashboard)/events/page.tsx`: async Server Component 전환, `searchParams`(q/status/page) 기반 `getAdminEventRows` 호출 + `events/loading.tsx` 신설
- [x] `app/admin/(dashboard)/users/page.tsx`: async Server Component 전환, `searchParams`(q/role/page) 기반 `getAdminUserRows` 호출, `auth.getClaims()`로 현재 관리자 id 조회해 자기 자신 삭제 방지 UI 연동 + `users/loading.tsx` 신설
- [x] `app/admin/(dashboard)/analytics/page.tsx`: async Server Component 전환, `searchParams.period`(7d/30d/90d, 잘못된 값은 7d로 폴백) 기반 `getEventTimeSeries`/`getUserTimeSeries`/`getEventStatusDistribution` 호출 + `analytics/loading.tsx` 신설
- [x] `components/admin/events-toolbar.tsx`, `components/admin/users-toolbar.tsx`: `useSearchParams`/`useRouter`로 검색어·필터 변경 시 URL 쿼리스트링 갱신(변경 시 `page=1`로 리셋)
- [x] `components/admin/admin-pagination.tsx`: `page`/`totalPages` 기반 실제 이전/다음 페이지 이동으로 교체
- [x] `components/admin/period-toggle.tsx`: `useSearchParams`로 현재 기간을 읽고 클릭 시 `?period=` 쿼리 갱신
- [x] `components/admin/row-action-button.tsx`: `DropdownMenu` + `AlertDialog`(신규 설치)로 삭제 확인 UX 구현, `itemLabel`/`onDelete`/`disabled` props 추가
- [x] `components/admin/admin-event-row-actions.tsx`, `components/admin/admin-user-row-actions.tsx` 신규: 브라우저 클라이언트로 `deleteEventAsAdmin`/`deleteUserAsAdmin` 호출 + toast + `router.refresh()`(사용자 쪽은 `isSelf`일 때 삭제 메뉴 비활성화)
- [x] `components/ui/alert-dialog.tsx` shadcn 컴포넌트 신규 설치
- [x] `lib/mock/admin.ts` 삭제, `lib/mock/index.ts`에서 admin 관련 re-export 제거(더 이상 사용하는 곳 없음 확인 후 정리; `getMockEvents`/`getMockUsers`는 다른 mock 파일에서 계속 사용되므로 유지)

## 수락 기준

- 기준 1: `/admin/dashboard`에서 실제 DB 값(이벤트/가입자 지표)이 표시됨 — **충족**(실 계정 수동 검증 완료, 아래 "수동 검증 완료" 참고)
- 기준 2: `/admin/events`에서 검색어/상태 필터/페이지네이션이 동작하고, 삭제 시 실제 `events` row가 삭제됨 — **충족**(실 계정 수동 검증 완료)
- 기준 3: `/admin/users`에서 검색어/역할 필터/페이지네이션이 동작하고, 삭제 시 실제 `profiles` row가 삭제되며 관리자 자기 자신은 삭제할 수 없음(UI 비활성화 + RLS 이중 방어) — **충족**(실 계정 수동 검증 완료, 사용자 삭제는 이번 검증에서는 UI 방어만 확인하고 실삭제는 이벤트로 대체 검증)
- 기준 4: `/admin/analytics`에서 기간(7일/30일/90일) 전환 시 차트 데이터가 갱신됨 — **충족**(실 계정 수동 검증 완료)
- 기준 5: `npm run type-check`, `npm run lint` 통과 — **충족**(아래 검증 로그 참고)

## 테스트 체크리스트

### 정적 검증

- `npm run type-check` → 에러 없음
- `npm run lint` → 에러/경고 없음
- 손댄 파일에 한해 `npx prettier --write`로 개별 포맷 확인(레포 전역의 사전 존재 포맷 불일치는 이번 작업과 무관 — 아래 "알려진 제약" 참고)

### Supabase 상태 검증

- `pg_policies` 조회로 `events_delete_admin`, `profiles_delete_admin` 정책 존재 확인
- `get_advisors(security)`: 기존 `auth_leaked_password_protection` 경고 외 신규 이슈 없음(이번 작업과 무관)

### Playwright MCP E2E

- [x] 비로그인 상태에서 `/admin/dashboard`, `/admin/events`, `/admin/users`, `/admin/analytics` 4개 경로 모두 `/auth/login`으로 리다이렉트되는 것을 확인(`proxy.ts` 1차 인증 가드가 관리자 라우트에도 동일하게 적용됨)
- [x] 실 관리자 계정(`rlaeogus0911@nate.com`, 이메일/비밀번호 로그인)으로 `/admin/dashboard` 접근 시 실제 DB 지표(이벤트/가입자 수)가 정확히 표시됨을 확인
- [x] `/admin/events`에서 검색어(`해변` → 1건)로 필터링되는 것을 확인
- [x] `/admin/events`에서 "모임추친" 이벤트를 실제로 삭제 → 확인 다이얼로그 → toast 성공 메시지 → 목록 즉시 갱신(2건→1건) → 대시보드 지표도 즉시 갱신(전체 이벤트 2→1) → `mcp__supabase__execute_sql`로 DB에서도 완전히 삭제되었음을 교차 확인
- [x] `/admin/users`에서 현재 로그인한 관리자 자신의 행은 삭제 메뉴가 `disabled` 상태로 렌더링되는 것을 확인(RLS `id != auth.uid()`와 UI 이중 방어 정상 동작)
- [x] `/admin/analytics`에서 "최근 30일" 버튼 클릭 시 URL이 `?period=30d`로 바뀌고 차트 x축이 07-19~08-17로 확장되는 것을 확인

### ⚠️ 알려진 제약 1: Google OAuth 동의 화면 자동화 한계 → 이메일/비밀번호 계정으로 대체 검증

`/admin/login`은 Google OAuth 버튼만 제공하지만, `app/admin/(dashboard)/layout.tsx`의 관리자 가드는 로그인 수단과 무관하게 세션의 `profiles.role === "admin"`만 확인한다. 이 점을 이용해 일반 `/auth/login`(이메일/비밀번호)으로 관리자 계정에 로그인한 뒤 `/admin/**`에 직접 접근하는 방식으로 실 계정 수동 검증을 완료했다(사용자가 제공한 실 관리자 계정 사용). Google 계정(`rlaeogus0911@gmail.com`) 기반 관리자 로그인 자체는 여전히 Playwright로 자동화할 수 없다는 제약이 남아있다.

### 🐛 수동 검증 중 발견 및 수정된 버그 (2026-08-17)

실 계정으로 `/admin/dashboard`, `/admin/events` 접근 시 브라우저 콘솔에 Next.js 16 `cacheComponents`(dynamicIO) "uncached data during prerendering" 에러가 발생함을 발견했다. Task 010에서 `app/(main)/layout.tsx`에 있었던 것과 동일한 패턴으로, `app/admin/(dashboard)/layout.tsx`가 `await supabase.auth.getClaims()`(및 `getUserProfile`)를 `<Suspense>` 경계 없이 직접 실행하고 있었던 것이 원인. `app/(main)/layout.tsx`의 `AuthGuard` 서브 컴포넌트 분리 패턴을 그대로 적용해 `AdminAuthGuard` 서브 컴포넌트로 분리하고 `<Suspense>`로 감쌌으며, `usePathname()`을 쓰는 `<AdminSidebar />`(Client Component)도 별도 `<Suspense>`로 감싸 해결했다. 수정 후 4개 관리자 페이지 모두 콘솔 에러 없이 정상 렌더링됨을 재확인함.

### 참고: 관리자 사이드바 로그아웃 버튼 미구현(이번 범위 아님)

수동 검증 중 `components/layout/admin-sidebar.tsx`의 "로그아웃" 버튼이 `onClick`이 TODO로 비어있어 클릭해도 아무 동작을 하지 않는 것을 확인했다. Task 006(UI 골격)/Task 008(인증)에서 남겨진 기존 이슈로, Task 011 범위(백엔드 데이터 연동)와 무관해 이번에는 손대지 않았다. 후속 태스크에서 `components/logout-button.tsx`의 로직을 재사용해 연결하는 것을 권장한다.

### ⚠️ 알려진 제약 2: 사용자 삭제 범위

관리자가 사용자를 삭제하면 `profiles` row만 삭제되고 `auth.users`는 남는다. `auth.users` 완전 삭제는 Supabase Admin API(service role key)가 필요한데, 이 프로젝트는 클라이언트/서버 모두 anon/publishable key만 사용하며 service role key를 도입한 사례가 없다. service role key 도입은 새로운 보안 경계(서버 전용 시크릿)를 만드는 일이라 이번 Task 011 범위에서는 제외하기로 사용자와 협의했다. 필요 시 후속 태스크에서 service role 기반 Edge Function 등으로 확장 검토 가능.

### ⚠️ 알려진 제약 3: 통계 시계열 집계 방식의 확장성

PostgREST가 SQL `GROUP BY`를 지원하지 않아 `getEventTimeSeries`/`getUserTimeSeries`는 기간 내 전체 row를 가져와 서버 컴포넌트에서 JS로 날짜별 집계한다. 현재 DB 규모(수 row)에서는 문제없지만, 데이터가 커지면 전체 fetch 비용이 증가하므로 향후 RPC(SQL 함수)나 구체화 뷰로 전환이 필요할 수 있다.

### 참고: 레포 전역 포맷 불일치

`npm run format:check` 실행 시 이번 작업과 무관한 기존 파일 다수(설정 파일, 이전 Task의 컴포넌트 등)에서도 포맷 경고가 발생했다(줄바꿈/따옴표 스타일 관련으로 추정, 사전에 존재하던 상태). 이번 Task 011에서 새로 만들거나 수정한 파일에는 `npx prettier --write`를 개별 적용해 포맷을 맞췄으며, 무관한 레포 전역 재포맷은 이번 작업 범위를 벗어나 진행하지 않았다.

## 관련 파일

- `F:\claude\nextjs-supabase-app2\lib\api\admin.ts` (신규)
- `F:\claude\nextjs-supabase-app2\lib\types\admin.ts` (수정)
- `F:\claude\nextjs-supabase-app2\app\admin\(dashboard)\dashboard\page.tsx` (수정)
- `F:\claude\nextjs-supabase-app2\app\admin\(dashboard)\dashboard\loading.tsx` (신규)
- `F:\claude\nextjs-supabase-app2\app\admin\(dashboard)\events\page.tsx` (수정)
- `F:\claude\nextjs-supabase-app2\app\admin\(dashboard)\events\loading.tsx` (신규)
- `F:\claude\nextjs-supabase-app2\app\admin\(dashboard)\users\page.tsx` (수정)
- `F:\claude\nextjs-supabase-app2\app\admin\(dashboard)\users\loading.tsx` (신규)
- `F:\claude\nextjs-supabase-app2\app\admin\(dashboard)\analytics\page.tsx` (수정)
- `F:\claude\nextjs-supabase-app2\app\admin\(dashboard)\analytics\loading.tsx` (신규)
- `F:\claude\nextjs-supabase-app2\components\admin\events-toolbar.tsx` (수정)
- `F:\claude\nextjs-supabase-app2\components\admin\users-toolbar.tsx` (수정)
- `F:\claude\nextjs-supabase-app2\components\admin\admin-pagination.tsx` (수정)
- `F:\claude\nextjs-supabase-app2\components\admin\period-toggle.tsx` (수정)
- `F:\claude\nextjs-supabase-app2\components\admin\row-action-button.tsx` (수정)
- `F:\claude\nextjs-supabase-app2\components\admin\admin-event-row-actions.tsx` (신규)
- `F:\claude\nextjs-supabase-app2\components\admin\admin-user-row-actions.tsx` (신규)
- `F:\claude\nextjs-supabase-app2\components\ui\alert-dialog.tsx` (신규)
- `F:\claude\nextjs-supabase-app2\lib\mock\admin.ts` (삭제)
- `F:\claude\nextjs-supabase-app2\lib\mock\index.ts` (수정)
- `F:\claude\nextjs-supabase-app2\app\admin\(dashboard)\layout.tsx` (수정 — 수동 검증 중 발견된 cacheComponents 렌더링 차단 버그 수정, `AdminAuthGuard` Suspense 분리)
