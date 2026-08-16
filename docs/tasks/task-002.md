# Task 002: 타입 정의 및 인터페이스 설계

## 개요

- **목표**: PRD의 데이터 모델(users, events, event_participants)과 페이지별 기능 명세(F001~~F015)를 기반으로, 아직 실제 DB가 없는 Phase 1~~2 단계에서 UI/컴포넌트 개발에 사용할 프론트엔드 타입 체계를 확립한다.
- **예상 소요 시간**: 1일
- **관련 기능**: F001~F015 전체 (타입 레벨 지원)
- **의존성**: Task 001 (프로젝트 구조 및 라우팅 설정 — 완료)

## 설계 방침

- `lib/types/` 디렉터리에 도메인별로 타입 파일을 분리한다 (barrel export로 `lib/types/index.ts`에서 재노출).
- Task 007(DB 스키마 확정)에서 `mcp__supabase__generate_typescript_types`로 생성될 `database.types.ts`가 **entity 타입의 최종 출처**가 된다. 지금 정의하는 `Event`, `User`, `EventParticipant`는 PRD 데이터 모델을 선반영한 **임시 타입**이며, Task 007에서 실제 스키마 타입으로 교체됨을 파일 상단 주석으로 명시한다.
- 목업 데이터(Task 003의 더미 데이터 유틸리티)도 이 타입들을 기준으로 작성되도록, 여기서 필드/네이밍을 확정한다.
- Props 타입은 컴포넌트 파일에 인접 정의(co-location)하는 것이 React 컨벤션에 맞지만, Task 003~006에서 여러 페이지가 공유할 핵심 컴포넌트(EventCard, ParticipantCard 등)의 Props는 재사용을 위해 `lib/types/components.ts`에 미리 선언한다.

## 구현 사항

- [ ] `lib/types/event.ts` — 이벤트 도메인 타입
  - `EventStatus = 'upcoming' | 'ongoing' | 'ended'` (F008)
  - `Event` 인터페이스: `id, title, description, location, eventDate, coverImageUrl, inviteCode, status, createdBy, participantCount, createdAt, updatedAt`
  - `EventWithParticipants` (상세 페이지용, `participants: EventParticipant[]` 포함)
  - `CreateEventInput` / `UpdateEventInput` (폼 제출용, Task 004 React Hook Form과 연동 예정)
- [ ] `lib/types/user.ts` — 사용자 도메인 타입
  - `UserRole = 'user' | 'admin'`
  - `User` 인터페이스: `id, email, name, avatarUrl, role, createdAt, updatedAt`
  - `PublicProfile` (참여자 목록 등에 노출되는 최소 정보: `id, name, avatarUrl`)
- [ ] `lib/types/participant.ts` — 참여자 도메인 타입
  - `ParticipantRole = 'host' | 'participant'`
  - `EventParticipant` 인터페이스: `id, eventId, userId, role, joinedAt, user: PublicProfile`
- [ ] `lib/types/api.ts` — API 응답 공통 타입
  - `ApiResponse<T> = { data: T; error: null } | { data: null; error: ApiError }`
  - `ApiError = { message: string; code?: string }`
  - `PaginatedResponse<T>` (관리자 테이블 F013/F014용: `items: T[], total: number, page: number, pageSize: number`)
- [ ] `lib/types/admin.ts` — 관리자 대시보드 타입 (F012~F015)
  - `DashboardMetrics` (오늘/이번 주/이번 달/전체 이벤트·사용자 수)
  - `AdminEventRow`, `AdminUserRow` (테이블 표시용 조합 타입, users/events 조인 결과 형태)
  - `StatsPeriod = '7d' | '30d' | '90d'`, `TimeSeriesPoint = { date: string; count: number }`
- [ ] `lib/types/components.ts` — 공용 컴포넌트 Props (Task 003에서 실제 구현)
  - `EventCardProps`, `ParticipantCardProps`, `EmptyStateProps`, `LoadingSkeletonProps`
- [ ] `lib/types/store.ts` — 전역 상태 타입 (인증 상태 등 Context/store로 관리할 값)
  - `AuthState = { user: User | null; isLoading: boolean }`
  - 현재 프로젝트에 전역 상태 라이브러리가 없으므로, React Context 훅(`useAuth` 등)이 반환할 형태로 정의 (Task 008 구현 시 사용)
- [ ] `lib/types/mock.ts` — 더미 데이터 전용 타입 (Task 003 연계)
  - `MockEvent`, `MockUser` 등 `Event`/`User`를 확장하되 DB 미연동 상태임을 표시하는 타입 (필요 시 `Event`를 그대로 재사용하고 별도 확장 없이 스킵 가능 — 구현 단계에서 판단)
- [ ] `lib/types/index.ts` — 위 파일들을 재노출하는 barrel export
- [ ] 각 파일 상단에 "임시 타입, Task 007에서 DB 스키마 타입으로 교체 예정" 주석 추가 (entity 타입 파일에 한함: event.ts, user.ts, participant.ts, admin.ts)

## 수락 기준

- 기준 1: `lib/types/` 하위에 위 8개 파일이 생성되고 `npm run type-check`가 에러 없이 통과한다.
- 기준 2: PRD 데이터 모델(users/events/event_participants)의 모든 필드가 대응하는 타입에 1:1로 반영되어 있다.
- 기준 3: Task 003~006에서 필요한 모든 UI 요소(이벤트 카드, 참여자 카드, 관리자 테이블 행, 통계 그래프 데이터)가 이미 정의된 타입만으로 표현 가능하다 (별도 임기응변 타입 추가 없이).
- 기준 4: 타입 파일에 런타임 로직(함수, DB 호출 등)이 없다 — 순수 타입/인터페이스 정의만 포함.

## 관련 파일

- /lib/types/event.ts
- /lib/types/user.ts
- /lib/types/participant.ts
- /lib/types/api.ts
- /lib/types/admin.ts
- /lib/types/components.ts
- /lib/types/store.ts
- /lib/types/mock.ts
- /lib/types/index.ts
