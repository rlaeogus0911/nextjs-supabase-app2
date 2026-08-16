# Task 006: 관리자 데스크톱 페이지 UI 완성 ✅ 완료

## 개요

- **목표**: 관리자 로그인 페이지와 데스크톱 대시보드(메인/이벤트 관리/사용자 관리/통계 분석) UI를 더미 데이터로 완성
- **예상 소요 시간**: 2일
- **관련 기능**: F012 (관리자 대시보드), F013 (이벤트 관리 테이블), F014 (사용자 관리 테이블), F015 (통계 분석)
- **의존성**: Task 003 (공통 컴포넌트), Task 001 (라우트 골격 — `app/admin/**`, `components/layout/admin-sidebar.tsx` 이미 존재)

## 현재 상태 (조사 결과)

- `app/admin/login/page.tsx`, `app/admin/(dashboard)/{dashboard,events,users,analytics}/page.tsx` — 라우트 파일은 존재하나 전부 `TODO` 플레이스홀더
- `app/admin/(dashboard)/layout.tsx` + `components/layout/admin-sidebar.tsx` — 사이드바 레이아웃은 이미 구현됨. 단, `bg-neutral-900 text-neutral-100`으로 다크 배색이 하드코딩되어 있어 테마 토큰 기반(Task 004/005 원칙)으로 점검 필요
- `lib/types/admin.ts` — `DashboardMetrics`, `AdminEventRow`, `AdminUserRow`, `StatsPeriod`, `TimeSeriesPoint` 타입 이미 정의됨(Task 007에서 실제 DB 타입으로 교체 예정인 임시 타입)
- `lib/mock/`에 관리자용 더미 데이터 생성 함수는 **없음** — 신규 작성 필요
- `components/ui/table.tsx` **없음** — `npx shadcn@latest add table` 필요
- `recharts` **미설치** — `npm install recharts` 필요
- `react-hook-form`, `zod`는 이미 설치됨(로그인 폼에 재사용 가능)

## 설계 방침

- **더미 데이터**: `lib/mock/events.ts`/`lib/mock/users.ts`의 기존 `getMockEvents()`/`getMockUsers()`를 가공해 `AdminEventRow[]`/`AdminUserRow[]`/`DashboardMetrics`/`TimeSeriesPoint[]`를 만드는 `lib/mock/admin.ts`를 신규 작성. 새 하드코딩 배열을 따로 만들지 않고 기존 이벤트/유저 더미를 재사용해 일관성 유지
- **관리자 로그인**: 실제 인증은 Task 008에서 구현. Task 006에서는 이메일 UI + `getMockUsers()`의 `admin-1` 계정을 활용한 폼 UI만 완성(제출 시 임시로 대시보드로 이동하거나 disabled 처리 — 실제 Supabase 인증 로직은 넣지 않음)
- **테이블**: shadcn `table` 컴포넌트를 추가 설치해 이벤트/사용자 관리 테이블에 공용으로 사용. 검색/필터 UI는 클라이언트 상태로 더미 동작만 구현(실제 API 연동은 Task 011)
- **차트**: `recharts`로 통계 분석 페이지에 최소 2종 차트(예: 기간별 이벤트/가입자 추이 라인 차트, 상태별 분포 파이/바 차트) 구현. 데이터는 `TimeSeriesPoint[]` 더미
- **사이드바 배색**: 기존 다크 하드코딩을 테마 토큰 기반으로 리팩터링할지 이번 Task 범위에 포함(작음 — 함께 처리)

## 구현 사항

- [x] `npm install recharts` 및 `npx shadcn@latest add table` 실행
- [x] `lib/mock/admin.ts` 작성 — `getMockDashboardMetrics()`, `getMockAdminEventRows()`, `getMockAdminUserRows()`, `getMockEventTimeSeries()`, `getMockUserTimeSeries()`, `getMockEventStatusDistribution()`
- [x] 관리자 로그인 페이지 UI 구현 (`app/admin/login/page.tsx`, `components/admin-login-form.tsx`)
  - 이메일/비밀번호 입력 폼(Card+Input+Label+Button, 플레이스홀더 제출 핸들러)
  - 관리자 전용 안내 문구, 일반 로그인과 구분되는 다크 톤 레이아웃
- [x] 관리자 대시보드 메인 페이지 UI 구현 (F012, `app/admin/(dashboard)/dashboard/page.tsx`, `components/admin/stats-card.tsx`)
  - 지표 카드 7개(오늘/이번 주/이번 달 이벤트 수, 오늘/이번 주 가입자 수, 전체 이벤트/사용자 수) — `DashboardMetrics` 기반
- [x] 이벤트 관리 테이블 페이지 UI 구현 (F013, `app/admin/(dashboard)/events/page.tsx`)
  - shadcn Table 기반 목록(제목/주최자/일시/참여자 수/상태 Badge/생성일/액션)
  - 검색 입력, 상태 필터 UI, 페이지네이션 UI(더미 동작)
- [x] 사용자 관리 테이블 페이지 UI 구현 (F014, `app/admin/(dashboard)/users/page.tsx`)
  - shadcn Table 기반 목록(Avatar/이름/이메일/역할 Badge/생성한 이벤트 수/참여한 이벤트 수/가입일/액션)
  - 검색 입력, 역할 필터 UI
- [x] 통계 분석 페이지 UI 구현 (F015, `app/admin/(dashboard)/analytics/page.tsx`, `components/admin/{event-trend-chart,user-trend-chart,status-distribution-chart}.tsx`)
  - 기간 선택(`StatsPeriod`: 7d/30d/90d) 버튼 그룹 UI(정적, "7d" 선택 상태)
  - Recharts 라인 차트 2종(이벤트/가입자 추이) + 바 차트 1종(상태 분포), 더미 `TimeSeriesPoint[]` 사용
- [x] `components/layout/admin-sidebar.tsx` 배색을 테마 토큰(`bg-card`/`text-foreground`/`text-muted-foreground`/`border-border`) 기반으로 정리
- [x] 반응형(sm/lg 브레이크포인트) 및 다크 모드 적용 확인

## 수락 기준

- 기준 1: 관리자 로그인/대시보드/이벤트 관리/사용자 관리/통계 분석 5개 페이지 모두 더미 데이터로 실제 UI가 렌더링됨(TODO 플레이스홀더 제거)
- 기준 2: 이벤트·사용자 관리 테이블에서 검색/필터 UI 조작 시 더미 데이터 기준으로 목록이 클라이언트에서 즉시 반영됨
- 기준 3: 통계 분석 페이지에서 기간 선택에 따라 차트 데이터(더미)가 갱신됨
- 기준 4: `npm run type-check`, `npm run lint` 통과
- 기준 5: 다크모드 토글 시 사이드바 포함 전체 관리자 화면이 테마 토큰 기반으로 정상 전환됨

## ⚠️ 알려진 제약

- `proxy.ts` 인증 가드로 인해 `/admin/**` 경로는 실 로그인 세션 없이는 Playwright 실기 테스트가 제한됨(Task 004/005와 동일한 제약). 관리자 role 체크 자체도 Task 008에서 구현되므로, 이번 Task에서는 코드 리뷰 + 타입체크/린트로 대체 검증하고, Task 008 완료 후 재검증 필요
- 실제 지표 집계 쿼리, 테이블 검색/필터/삭제 API, 통계 데이터 API는 Task 011에서 구현 — 이번 Task는 UI와 더미 데이터 배선까지만

## 테스트 체크리스트

- [ ] (Task 008 이후 재검증) 관리자 계정 로그인 → 대시보드 리다이렉트 플로우 E2E
- [ ] (Task 008 이후 재검증) 비관리자 계정으로 `/admin/**` 접근 시 차단 확인
- [ ] (Task 011 이후 재검증) 이벤트/사용자 관리 테이블 검색·필터·삭제 API 연동 E2E
- [ ] (Task 011 이후 재검증) 통계 분석 페이지 실제 데이터 API 연동 확인

## 관련 파일

- F:\claude\nextjs-supabase-app2\app\admin\login\page.tsx
- F:\claude\nextjs-supabase-app2\app\admin\(dashboard)\layout.tsx
- F:\claude\nextjs-supabase-app2\app\admin\(dashboard)\dashboard\page.tsx
- F:\claude\nextjs-supabase-app2\app\admin\(dashboard)\events\page.tsx
- F:\claude\nextjs-supabase-app2\app\admin\(dashboard)\users\page.tsx
- F:\claude\nextjs-supabase-app2\app\admin\(dashboard)\analytics\page.tsx
- F:\claude\nextjs-supabase-app2\components\layout\admin-sidebar.tsx
- F:\claude\nextjs-supabase-app2\lib\types\admin.ts
- F:\claude\nextjs-supabase-app2\lib\mock\admin.ts (신규)
- F:\claude\nextjs-supabase-app2\components\ui\table.tsx (신규, shadcn add)
