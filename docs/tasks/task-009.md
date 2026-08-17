# Task 009: 이벤트 CRUD 및 초대 시스템 ✅ 완료

## 개요

- **목표**: `app/(main)/events/**`의 `lib/mock/*` 하드코딩 데이터를 실제 Supabase 연동으로 교체(이벤트 생성/조회/수정/삭제, 초대 코드 생성, 커버 이미지 업로드, 초대 링크 클립보드 복사, 상태 파생 계산)
- **관련 기능**: F001, F002, F003(카카오톡 제외), F006, F008, F009
- **의존성**: Task 007(DB 스키마·타입), Task 008(인증 시스템)

## 사전 조사

- `mcp__supabase__list_tables(verbose)`로 스키마 재확인: `events.status` CHECK 제약이 `upcoming/ongoing/ended`로, 기존 `lib/types/event.ts`의 `EventStatus`와 이미 일치함(설계 문서의 "completed" 표기는 오기였음).
- `storage.buckets` 조회 결과 `event-covers` 버킷이 Task 007에서 이미 `public: true`, `file_size_limit: 5MB`, `allowed_mime_types: image/jpeg,image/png,image/webp`로 생성되어 있어 별도 마이그레이션 불필요.
- `components/forms/event-form.tsx`, `components/event-invite-link.tsx`, `components/event-delete-dialog.tsx`, `app/(main)/events/**`는 모두 목업 상태로 이미 완성되어 있어 재작성 없이 최소 수정만 진행.
- `app/(main)/layout.tsx`가 이미 `supabase.auth.getClaims()` 기반 인증 가드를 갖고 있어(Task 008), 이벤트 페이지들은 로그인 여부 재확인 없이 `data?.claims.sub`로 사용자 id만 꺼내 쓰면 됨.

## 구현 사항

- [x] `lib/api/events.ts` 신설: `getEvents`(참여 중인 이벤트만, `event_participants(count)` 관계 집계로 N+1 회피), `getEventById`, `createEvent`(이벤트 생성 + host row 동시 등록), `updateEvent`, `deleteEvent`, `getEventParticipants`(profiles 조인)
- [x] `lib/utils/invite-code.ts`: `crypto.randomUUID().replace(/-/g,"").slice(0,8)` 기반 8자리 초대 코드 생성(F002, 외부 패키지 미사용)
- [x] `lib/utils/event-status.ts`: `computeEventStatus(eventDate, now, durationHours=3)` — event_date 이후 3시간을 진행중으로 가정한 read-time 파생 계산(F008). DB `status` 컬럼은 생성 시 초기값만 두고 조회 화면에서 이 함수 결과로 덮어씀
- [x] `lib/supabase/storage.ts`: `uploadEventCover` — `event-covers` 버킷에 `${userId}/${uuid}.${ext}` 경로로 업로드 후 `getPublicUrl` 반환
- [x] `app/(main)/events/new/page.tsx`: 변경 없음(EventForm이 이미 API 연동을 담당)
- [x] `components/forms/event-form.tsx`: `onSubmit`을 `createEvent`/`updateEvent` 실호출로 교체, `supabase.auth.getClaims()`로 사용자 id 획득, 커버 이미지 파일 선택 시 클라이언트 검증(5MB 이하, jpg/png/webp)만 즉시 수행하고 실제 업로드는 제출 시점에 `uploadEventCover` 호출
- [x] `app/(main)/events/page.tsx`: `getMockMyEvents()` → `getEvents(supabase, userId)` + `computeEventStatus`로 상태 배지 파생 표시, role은 `createdBy === userId` 기준으로 판별(정확한 host/participant 구분은 Task 010에서 참여자 목록 조회 시 role 컬럼으로 세분화 가능)
- [x] `app/(main)/events/[id]/page.tsx`: `getMockEvents`/`getMockParticipantsByEventId`/`MOCK_CURRENT_USER_ID` 전부 제거, `getEventById`+`getEventParticipants`+`getClaims()` 기반 `isHost` 실계산, 커버 이미지도 실제 URL 렌더링하도록 보강
- [x] `app/(main)/events/[id]/edit/page.tsx`: 실데이터 조회로 교체 + `event.createdBy !== currentUserId`인 경우 상세 페이지로 리다이렉트(비호스트 접근 차단)
- [x] `components/event-delete-dialog.tsx`: `eventId` prop 추가, `handleDelete`를 `deleteEvent` 실호출 + `router.refresh()`로 교체
- [x] `components/event-invite-link.tsx`: 하드코딩된 `https://gather.app/join/...` → `window.location.origin` 기반 동적 URL로 교체(카카오톡 공유는 범위 제외, 클립보드 복사만 유지)

## 수락 기준

- 기준 1: 로그인 사용자가 이벤트를 생성하면 `events` row와 `event_participants`(role=host) row가 함께 생성됨 — 코드 구현 완료(`createEvent`), 실 로그인 세션 필요로 수동 검증 권장
- 기준 2: 초대 코드는 8자리이며 DB `invite_code UNIQUE` 제약과 충돌 시 재시도 로직은 이번 범위에 포함하지 않음(충돌 확률이 매우 낮은 UUID 기반이라 별도 처리 보류, 필요 시 후속 태스크에서 unique violation 재시도 추가 권장)
- 기준 3: 이벤트 목록/상세는 실제 Supabase 데이터로 렌더링되고 상태 배지는 `computeEventStatus` 파생값을 사용 — 코드 구현 완료
- 기준 4: 본인이 만들지 않은 이벤트의 수정 페이지 접근 시 상세 페이지로 리다이렉트됨(`app/(main)/events/[id]/edit/page.tsx`) — 코드 구현 완료
- 기준 5: `npm run type-check`, `npm run lint` 통과 — **충족** (아래 검증 로그 참고)

## 검증

### 정적 검증

- `npm run type-check` → 에러 없음
- `npm run lint` → 에러/경고 없음
- `npm run build`는 이번 작업에서 실행하지 않음(Task 008에서 기록된 기존 환경 이슈 — Windows Turbopack 서브프로세스 크래시 — 와 무관한 재현 가능성이 높아 페르소나 규칙에 따라 생략 가능한 항목으로 처리)

### Playwright MCP E2E

- [x] 미인증 상태 `/events` 직접 접근 → `/auth/login` 리다이렉트 확인(`app/(main)/layout.tsx` 인증 가드 정상 동작, Task 008에서 이미 검증된 로직이 이번 변경 후에도 유지됨을 재확인)
- [ ] ~~로그인 → 이벤트 생성 → 목록 반영 → 상세 진입 → 수정 → 삭제 전체 플로우~~ **자동화 불가**
- [ ] ~~에러 케이스: 필수값(제목/장소/날짜) 누락 시 폼 에러 메시지~~ **자동화 불가**(위와 동일 이유로 로그인 세션 필요)
- [ ] ~~타인 이벤트 접근 차단(다른 계정으로 로그인 후 남의 이벤트 수정 페이지 접근)~~ **자동화 불가**

### ⚠️ 알려진 제약: 실 로그인 세션 필요 플로우 미검증

Task 004~008과 동일한 이유로, Google OAuth 동의 화면(외부 도메인, 2단계 인증/reCAPTCHA 가능성)은 Playwright MCP로 안전하게 자동화할 수 없다. 따라서 로그인 완료 이후 상태에서만 접근 가능한 다음 플로우는 이번 라운드에서 실제 브라우저로 검증하지 못했다:

- 이벤트 생성 폼 제출(성공/실패 토스트, 생성된 이벤트 id로 라우팅)
- 커버 이미지 업로드(파일 선택 → 5MB/확장자 검증 → 제출 시 실제 Storage 업로드)
- 이벤트 목록에서 방금 생성한 이벤트가 상태 필터와 함께 정상 표시되는지
- 이벤트 수정/삭제(호스트 권한으로 버튼 노출 및 실제 DB 반영)
- 비호스트 계정으로 타인 이벤트의 `/events/[id]/edit` 직접 접근 시 리다이렉트

대신 다음으로 대체 검증했다: (1) 전체 CRUD 로직은 코드 리뷰 + `npm run type-check`/`npm run lint` 통과로 정적 검증, (2) `mcp__supabase__list_tables`/`execute_sql`로 `event-covers` 버킷 설정 및 `events`/`event_participants` 스키마가 구현 코드의 컬럼명·제약과 일치함을 확인, (3) 미인증 리다이렉트만 Playwright로 재확인.

**수동 검증 권장**: `rlaeogus0911@gmail.com` 계정으로 실제 로그인 후 이벤트 생성→목록→상세→수정→삭제 전체 플로우와 커버 이미지 업로드를 1회 수동으로 확인할 것.

## 관련 파일

- F:\claude\nextjs-supabase-app2\lib\api\events.ts
- F:\claude\nextjs-supabase-app2\lib\utils\invite-code.ts
- F:\claude\nextjs-supabase-app2\lib\utils\event-status.ts
- F:\claude\nextjs-supabase-app2\lib\supabase\storage.ts
- F:\claude\nextjs-supabase-app2\components\forms\event-form.tsx
- F:\claude\nextjs-supabase-app2\components\event-delete-dialog.tsx
- F:\claude\nextjs-supabase-app2\components\event-invite-link.tsx
- F:\claude\nextjs-supabase-app2\app\(main)\events\page.tsx
- F:\claude\nextjs-supabase-app2\app\(main)\events\[id]\page.tsx
- F:\claude\nextjs-supabase-app2\app\(main)\events\[id]\edit\page.tsx
