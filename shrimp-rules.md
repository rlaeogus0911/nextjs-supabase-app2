# Development Guidelines (AI Agent용)

이 문서는 AI Agent(Coding Agent)가 이 저장소에서 코드를 수정할 때 지켜야 할 프로젝트 고유 규칙만 담는다. 일반적인 Next.js/React/TypeScript 지식은 다루지 않는다.

## 프로젝트 개요

- Next.js 16(App Router) + Supabase 인증 스타터. `src/` 디렉터리 없음 — `app/`, `components/`, `lib/`가 리포지토리 루트에 위치.
- 경로 별칭 `@/*` → 리포지토리 루트(`tsconfig.json`).
- 테스트 러너 없음. `npm run lint`, `npm run type-check`, `npm run format:check`로만 검증.

## 디렉터리 및 파일 배치 규칙

- 새 페이지: `app/` 하위에 라우트 세그먼트 폴더 + `page.tsx`로 추가. 인증 필요 페이지는 `app/protected/` 패턴(서버 컴포넌트에서 `supabase.auth.getClaims()` 확인 후 없으면 `redirect("/auth/login")`)을 따를 것.
- 새 인증 관련 페이지/라우트는 `app/auth/` 하위에 추가. `proxy.ts`가 `/`, `/login`, `/auth/*`를 제외한 모든 경로를 인증 없이 접근 시 `/auth/login`으로 리다이렉트하므로, 새 공개(비로그인) 라우트를 추가할 경우 반드시 `proxy.ts`의 예외 경로 로직을 함께 수정할 것.
- 재사용 UI 컴포넌트: `components/` 루트에 추가. shadcn/ui 기본 컴포넌트는 `components/ui/`에 위치 — 이 폴더 내 파일은 `npx shadcn@latest add <name>`으로만 생성/갱신하고 손으로 새로 만들지 말 것.
- Supabase 클라이언트 팩토리는 `lib/supabase/client.ts`(브라우저), `lib/supabase/server.ts`(Server Component/Action), `lib/supabase/proxy.ts`(proxy용) 세 개로 용도가 분리되어 있음 — **서로 통합하거나 하나로 대체하지 말 것**. 새 코드에서 Supabase 클라이언트가 필요하면 실행 컨텍스트(브라우저/서버/프록시)에 맞는 파일만 import.
- `lib/supabase/server.ts`의 클라이언트 생성 함수는 매 요청마다 새로 호출해서 생성해야 함 — 모듈 전역 변수에 클라이언트 인스턴스를 캐싱하지 말 것(Fluid compute 호환성 문제).

## 인증 폼 작성 규칙

- 새 인증 폼(로그인/회원가입/비밀번호 재설정 등)을 만들 때는 `components/login-form.tsx`를 기준으로 삼을 것: Client Component + `useState` + `lib/supabase/client.ts`의 브라우저 클라이언트로 Supabase Auth를 직접 호출하는 패턴.
- **`docs/guides/forms-react-hook-form.md`가 설명하는 아키텍처(Server Actions, `app/actions/`, `components/forms/`, `lib/schemas/`, `components/ui/form.tsx`, react-hook-form/zod)를 실제 코드에 적용하지 말 것** — 이 문서는 아직 미채택 상태의 참고 문서이며, 해당 패키지들은 `package.json`에 없다. 폼 관련 작업 시 이 문서를 구현 근거로 인용하지 말 것.

## 스타일링 규칙

- Tailwind는 v3(`^3.4.1`) + `tailwind.config.ts` + `@tailwind` 지시어 사용. v4 문법(`@theme`, CSS-first config 등)을 도입하지 말 것.
- 애니메이션은 `tailwindcss-animate` 플러그인 기반 `data-[state=open]:animate-in` 형태의 클래스를 사용(`components/ui/dropdown-menu.tsx` 참고). `tw-animate-css`(존재하지 않는 패키지) 또는 `animate-fadeIn` 같은 커스텀 유틸 클래스명을 새로 만들지 말 것.
- 색상/테마 변수는 `app/globals.css`에서 관리(`src/app/globals.css` 아님). 다크모드는 `next-themes`(`app/layout.tsx`의 `ThemeProvider`, `attribute="class"`)로 처리 — 별도 다크모드 로직을 추가하지 말 것.

## Next.js 16 규칙

- `params`, `searchParams`, `cookies()`, `headers()`는 모두 Promise다. 동기 접근 코드(예: `params.id` 직접 접근)를 작성하면 빌드 에러가 발생하므로 항상 `await` 사용.
- `next.config.ts`에는 `cacheComponents: true`만 설정되어 있음. `typedRoutes`, 커스텀 `turbopack` 옵션을 임의로 추가하지 말 것(미설정이 의도된 상태).
- `next`, `@supabase/ssr`, `@supabase/supabase-js` 버전은 `"latest"`로 열려 있음. 이 패키지들과 관련된 동작을 디버깅할 때는 코드 수정 전에 `npm ls <package>`로 실제 설치 버전을 먼저 확인할 것.

## Supabase 스키마 변경 규칙

- 로컬 `supabase/migrations/` 디렉터리는 존재하지 않음 — Supabase MCP가 원격 프로젝트(`pviqdmxduwvnjicsnypk`)에 직접 연결됨.
- 스키마 변경(`mcp__supabase__apply_migration` 등)은 **원격에 즉시 반영**되므로, 변경 전 반드시 `mcp__supabase__list_tables`로 현재 구조를 먼저 확인할 것. 로컬 migration 파일을 새로 만들지 말 것(이 프로젝트 구조에 없음).

## 여러 파일 동시 수정이 필요한 경우

- `proxy.ts`에서 공개 경로 목록을 바꾸면, 해당 경로에 대응하는 페이지가 `app/` 하위에 실제로 존재하는지 함께 확인/생성할 것.
- `components.json`의 alias/스타일 설정을 변경하면 `tsconfig.json`의 경로 별칭(`@/*`)과 어긋나지 않는지 함께 확인할 것.
- `docs/guides/project-structure.md`, `docs/guides/nextjs-16.md`는 실제 코드와 동기화된 최신 문서이므로, 디렉터리 구조나 Next.js 16 설정을 변경하면 이 두 문서도 함께 갱신할 것. 반대로 `docs/guides/forms-react-hook-form.md`, `docs/guides/component-patterns.md`, `docs/guides/styling-guide.md`는 참고용/부분 검증 문서이므로 구현 근거로 삼지 말 것(단, styling-guide는 v3 기준으로 수정 완료됨).

## 금지 사항

- `lib/supabase/`의 세 클라이언트 팩토리를 하나로 통합하거나 서로 대체 사용 금지.
- Server 전용 Supabase 클라이언트를 모듈 전역에 캐싱 금지.
- `components/ui/` 내 shadcn 컴포넌트를 CLI 없이 수작업으로 새로 생성 금지.
- Tailwind v4 문법/패키지 도입 금지.
- `forms-react-hook-form.md` 기반 아키텍처(react-hook-form, zod, `app/actions/`)를 실제 코드에 도입 금지(사용자가 명시적으로 마이그레이션을 요청하지 않는 한).
- `params`/`searchParams`/`cookies()`/`headers()` 동기 접근 금지.
- 로컬 `supabase/migrations/` 파일 생성 금지 — MCP로 원격에 직접 적용.
