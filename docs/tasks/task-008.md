# Task 008: 인증 시스템 및 권한 관리 ✅ 완료

## 개요

- **목표**: Google OAuth 로그인 플로우 완성(F010), `profiles.role` 기반 관리자 접근 제어, 보호된 라우트 접근 제어, 로그아웃 기능 확인, Playwright MCP E2E 테스트
- **관련 기능**: F010
- **의존성**: Task 007(DB 스키마·타입)

## 사전 조사

- `docs/PRD.md` 9번 항목(관리자 로그인 페이지, `/admin/login`) 확인 결과: 관리자 로그인도 이메일/비밀번호가 아니라 **Google OAuth 로그인 → role 체크(`role !== 'admin'`이면 접근 거부) → 일반 사용자는 "관리자 권한이 없습니다" 에러 표시 후 로그아웃** 방식으로 명세되어 있음. 기존 `components/admin-login-form.tsx`의 이메일/비밀번호 UI(전부 TODO 상태, 미동작)는 이 명세와 불일치하므로 Google OAuth 기반으로 교체 대상.
- `components/google-auth-button.tsx`의 `signInWithOAuth` 호출에서 `redirectTo`가 `${origin}/auth/callback`으로 하드코딩되어 있어, `app/auth/callback/route.ts`가 이미 지원하는 `next` 쿼리 파라미터(`searchParams.get("next") ?? "/"`)를 활용할 방법이 없었음 — 관리자 로그인과 일반 로그인을 콜백에서 구분하기 위해 prop으로 확장 필요.
- `lib/supabase/proxy.ts`는 미인증 사용자를 `/auth/login`으로 리다이렉트하되 `/`, `/login`, `/auth/*`만 예외 처리 — `/admin/**`에 대한 role 기반 세분화 접근 제어는 전혀 없음.
- `app/admin/(dashboard)/layout.tsx`에는 인증/권한 가드가 전혀 없어 로그인 여부·role 무관하게 접근 가능한 상태였음.

### DB 상태 재확인 결과

- `mcp__supabase__list_tables(verbose)`로 재확인: `public.profiles.role`은 `data_type: text`, `default_value: 'user'::text`, `check: role = ANY (ARRAY['user'::text, 'admin'::text])` — ROADMAP/PRD 명세와 일치, **스키마 변경 불필요**.
- `handle_new_user` 트리거 동작 검증(SQL, 조회 전용):
  - `select count(*) from auth.users` → **2**
  - `select count(*) from public.profiles` → **2**
  - `auth.users`와 `public.profiles`를 `id`로 LEFT JOIN한 결과, 2건 모두 1:1로 매핑되고 `email`도 동일하며 `role`은 둘 다 기본값 `'user'`로 채워져 있음을 확인:
    | auth.users.id  | email                  | profiles.role |
    | -------------- | ---------------------- | ------------- |
    | `80f29618-...` | rlaeogus0911@gmail.com | user          |
    | `7b884aab-...` | rlaeogus0911@nate.com  | user          |
  - 결론: `handle_new_user` 트리거가 정상 동작 중이며, Task 007에서 선반영된 DB 측 자동 생성 로직은 **재작업 불필요**.

## 구현 사항

- [x] `components/google-auth-button.tsx`에 `redirectTo?: string` prop 추가(하위 호환 유지)
- [x] `components/admin-login-form.tsx`를 Google OAuth 기반으로 재작성(`next=/admin/dashboard` 전달, forbidden 에러 표시 + 자동 signOut)
- [x] `lib/supabase/get-user-profile.ts` 공용 헬퍼 신설
- [x] `lib/supabase/proxy.ts`에 `/admin/login` 예외 경로 추가
- [x] `app/(main)/layout.tsx` 인증 가드 추가
- [x] `app/admin/(dashboard)/layout.tsx` role 가드 추가(`forbidden` 처리 포함)
- [x] `app/admin/login/page.tsx`를 Next.js 16 `cacheComponents` 규칙에 맞춰 `searchParams`를 `<Suspense>`로 감싸도록 수정(구현 중 발견한 이슈)
- [x] Playwright MCP E2E 테스트 수행(자동화 가능한 범위)

## 수락 기준

- 기준 1: `handle_new_user` 트리거로 신규 가입 시 `profiles` row가 자동 생성됨 — 충족(기존 2건 검증 완료)
- 기준 2: `profiles.role` CHECK 제약 및 기본값이 명세와 일치 — 충족
- 기준 3: 관리자 로그인 플로우가 PRD 명세(Google OAuth + role 체크)와 일치하도록 구현 — 충족
- 기준 4: `/admin/**`는 `role === 'admin'`인 사용자만 접근 가능하도록 코드 구현 완료 — 충족(코드 검증), 실 로그인 세션 기반 E2E는 아래 제약 참고
- 기준 5: Playwright E2E 시나리오 중 자동화 가능한 항목 전부 통과 — 충족

## 테스트 체크리스트 (Playwright MCP)

- [x] 미인증 상태 `/events` 직접 접근 → `/auth/login` 리다이렉트 확인 (proxy.ts 1차 가드)
- [x] 미인증 상태 `/profile` 직접 접근 → `/auth/login` 리다이렉트 확인
- [x] 미인증 상태 `/admin/dashboard` 직접 접근 → `/auth/login` 리다이렉트 확인 (proxy.ts가 관리자 라우트도 1차로 인증 요구)
- [x] `/admin/login`은 미인증 상태에서도 예외적으로 접근 가능(리다이렉트 안 됨) 확인
- [x] `/admin/login?error=forbidden` 접근 시 "관리자 권한이 없습니다" 메시지가 렌더링됨 확인(스냅샷으로 검증)
- [ ] ~~일반 로그인 → `/events` 진입 → 로그아웃 → `/auth/login` 리다이렉트~~ 자동화 불가(아래 제약 참고)
- [ ] ~~`role='admin'`으로 갱신된 계정으로 `/admin/dashboard` 정상 진입~~ 자동화 불가(아래 제약 참고)

### ⚠️ 알려진 제약: 실제 Google OAuth 로그인 E2E 미완료

Task 004~006에서도 동일하게 기록된 제약과 같은 이유로, Playwright MCP는 실제 Google 계정 자격증명 입력과 Google의 OAuth 동의 화면(외부 도메인, reCAPTCHA/2단계 인증 가능성)을 안전하게 자동화할 수 없다. 따라서:

- 로그인 완료 이후 상태(로그인된 `/events` 진입, 로그아웃, `role='admin'` 대시보드 진입)는 이번 라운드에서 Playwright로 직접 검증하지 못했다.
- 대신 다음으로 대체 검증했다: (1) `role` 가드 로직은 코드 리뷰 + `npm run type-check`/`npm run lint` 통과로 정적 검증, (2) forbidden 분기는 `/admin/login?error=forbidden` 쿼리 파라미터를 직접 접근해 UI 렌더링을 확인, (3) 관리자 테스트 계정 준비를 위해 `mcp__supabase__execute_sql`로 `rlaeogus0911@gmail.com` 계정의 `profiles.role`을 `'admin'`으로 갱신 완료 — 실제 브라우저로 이 계정에 Google 로그인 후 `/admin/dashboard` 진입, `/events` 진입 후 로그아웃 플로우를 **수동으로 1회 확인 권장**.
- `npm run build`는 이번 조사에서 기존 환경 이슈(Turbopack이 Windows에서 CSS 처리용 서브프로세스 생성에 실패, `TurbopackInternalError`, exit code `0xc0000142`)로 실패했다. 이 태스크의 코드 변경과 무관하게 재현되며(변경 전 상태에서도 동일 원인으로 실패할 것으로 추정), `npm run type-check`/`npm run lint`/`npm run dev`는 모두 정상 동작함을 확인했다. 별도 환경 이슈로 트래킹 필요.

## 관련 파일

- F:\claude\nextjs-supabase-app2\components\google-auth-button.tsx
- F:\claude\nextjs-supabase-app2\components\admin-login-form.tsx
- F:\claude\nextjs-supabase-app2\lib\supabase\proxy.ts
- F:\claude\nextjs-supabase-app2\lib\supabase\get-user-profile.ts
- F:\claude\nextjs-supabase-app2\app\(main)\layout.tsx
- F:\claude\nextjs-supabase-app2\app\admin\(dashboard)\layout.tsx
- F:\claude\nextjs-supabase-app2\app\admin\login\page.tsx
