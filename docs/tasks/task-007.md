# Task 007: 데이터베이스 스키마 및 Supabase 초기 설정 ✅ 완료

## 개요

- **목표**: `profiles`/`events`/`event_participants` 테이블, RLS 정책, 인덱스, Storage 버킷(`event-covers`), Realtime 구독, DB 타입/매퍼 레이어를 완성해 Task 008 이후의 백엔드 구현이 즉시 가능한 상태로 만든다
- **예상 소요 시간**: 검증·문서화 위주로 0.5일(핵심 스키마 작업은 이전 라운드에 선반영되어 있었음)
- **관련 기능**: 전체 기능(F001~F015)의 데이터 기반
- **의존성**: Task 002(임시 타입 정의), Task 003~006(UI 완성으로 요구사항 확정)

## 현재 상태 (조사 결과)

이번 Task 착수 시점에 원격 Supabase 프로젝트(`pviqdmxduwvnjicsnypk`)와 로컬 코드에 스키마 작업이 **이미 대부분 구현되어 있음**을 확인했다. 이번 Task는 신규 설계가 아니라 기존 구현의 사실 검증과 gap 처리, 문서화로 진행했다.

- 12개 마이그레이션이 이미 적용됨: `create_profiles_table` → `harden_profile_trigger_functions` → `add_role_to_profiles` → `create_events_table` → `create_event_participants_table` → `enable_rls_and_policies` → `drop_instruments_table` → `cleanup_duplicate_profile_policies` → `enable_realtime_for_events_and_participants` → `restrict_handle_new_user_execute` → `revoke_public_execute_handle_new_user` → `optimize_rls_initplan`
- `lib/supabase/database.types.ts`, `lib/mappers.ts`(DB row → UI 타입 camelCase 변환)도 이미 작성되어 있고 `lib/types/{user,event,participant}.ts`와 필드 매핑이 정합적임

## 구현 사항

- [x] `profiles`(id/email/username/full_name/avatar_url/role/created_at/updated_at), `events`(id/title/description/location/event_date/cover_image_url/invite_code/status/created_by/created_at/updated_at), `event_participants`(id/event_id/user_id/role/joined_at) 3개 테이블 생성 및 RLS 활성화 — `mcp__supabase__list_tables(verbose)`로 컬럼/PK/FK 확인
- [x] `status`(`upcoming|ongoing|ended`), `role`(profiles: `user|admin`, event_participants: `host|participant`) CHECK 제약으로 enum 동등 효과 적용 확인
- [x] RLS 정책: `profiles`(select 공개/insert·update 본인), `events`(select 공개/insert·update·delete 본인), `event_participants`(select 공개/insert·delete 본인) — `pg_policies` 조회로 확인. `optimize_rls_initplan` 마이그레이션으로 `(select auth.uid())` 패턴 적용되어 성능 최적화까지 완료
- [x] 인덱스 4종: `events_invite_code_key`(unique), `events_created_by_idx`, `event_participants_event_id_idx`, `event_participants_user_id_idx` — ROADMAP 요구 인덱스 전부 존재. 복합 `event_participants_event_id_user_id_key`(unique)로 중복 참여 방지도 DB 레벨에서 보장됨 — `pg_indexes` 조회로 확인
- [x] Storage 버킷 `event-covers` 생성 확인: `public=true`, `file_size_limit=5242880`(5MB), `allowed_mime_types=[image/jpeg, image/png, image/webp]` — `storage.buckets` 조회로 확인
- [x] Realtime 구독 준비: `select * from pg_publication_tables where pubname='supabase_realtime'` 조회 결과 `events`, `event_participants` 모두 포함(rowfilter 없음) 확인
- [x] `lib/supabase/database.types.ts` 최신성 검증: `mcp__supabase__generate_typescript_types` 결과와 로컬 파일을 diff한 결과 완전히 동일(Row/Insert/Update, FK relationships, PostgrestVersion `14.15` 포함) — 갱신 불필요
- [x] `event_participants` UPDATE RLS 정책 부재 여부 재검토: `ParticipantRole`(`lib/types/participant.ts`) 사용처를 전역 grep한 결과 `components/participant-card.tsx`, `app/(main)/events/[id]/page.tsx` 2곳 모두 읽기 전용 조건분기(배지 표시/호스트 UI 노출)뿐이며, `docs/tasks/task-004.md`·`task-005.md`에도 role 승격/강등 요구사항이 없음을 확인. **role은 가입 시 고정값이며 변경 요구사항이 없으므로 UPDATE 정책 부재는 의도된 설계로 결론**(추가 정책 미적용)
- [x] `mcp__supabase__get_advisors({type:'security'})` / `({type:'performance'})` 재확인: 스키마 관련 경고 없음(유일한 WARN은 `leaked_password_protection` — Auth 설정이며 Task 007 범위 밖, `unused_index` INFO 1건은 데이터 0건 상태의 정상 결과)

## 수락 기준

- 기준 1: `profiles`/`events`/`event_participants` 3개 테이블이 RLS 활성화 상태로 존재 — 충족(`list_tables` 확인)
- 기준 2: ROADMAP이 명시한 4개 인덱스(`invite_code`, `created_by`, `event_id`, `user_id`)가 모두 존재 — 충족(`pg_indexes` 확인)
- 기준 3: `event-covers` Storage 버킷이 존재하고 이미지 업로드 제약(크기/타입)이 설정됨 — 충족(`storage.buckets` 확인)
- 기준 4: `events`, `event_participants`가 Realtime publication에 포함됨 — 충족(`pg_publication_tables` 확인)
- 기준 5: `get_advisors(security/performance)`에 스키마 관련 신규 경고 없음 — 충족
- 기준 6: `lib/supabase/database.types.ts`가 원격 스키마와 100% 일치 — 충족(diff 결과 동일)

## ⚠️ 알려진 제약

- `app/(main)/events/**`, `app/admin/**` 페이지들은 여전히 `lib/mock/*`의 더미 데이터를 직접 호출 중이며, 실제 Supabase 데이터 연동(이벤트 CRUD, 참여자 관리, 관리자 통계 쿼리)은 **Task 009/010/011 범위**다. Task 007은 DB 스키마·타입·매퍼 레이어까지만 완결하며, UI를 실제 데이터로 배선하는 작업은 포함하지 않는다
- `handle_new_user` 트리거 관련 마이그레이션(`harden_profile_trigger_functions`, `restrict_handle_new_user_execute`, `revoke_public_execute_handle_new_user`)이 이미 적용되어 있어 Task 008 "사용자 프로필 자동 생성 로직"의 DB 측 기반도 선반영된 상태 — Task 008 착수 시 재확인 필요
- `leaked_password_protection` Auth 설정은 Task 007 범위가 아니므로 미적용 상태로 남김 — Task 008(인증 시스템) 진행 시 함께 검토 권장

## 관련 파일

- F:\claude\nextjs-supabase-app2\lib\supabase\database.types.ts
- F:\claude\nextjs-supabase-app2\lib\mappers.ts
- F:\claude\nextjs-supabase-app2\lib\types\user.ts
- F:\claude\nextjs-supabase-app2\lib\types\event.ts
- F:\claude\nextjs-supabase-app2\lib\types\participant.ts
- F:\claude\nextjs-supabase-app2\lib\types\admin.ts
- Supabase 원격 프로젝트(ref: `pviqdmxduwvnjicsnypk`) — `profiles`/`events`/`event_participants` 테이블, `event-covers` Storage 버킷, 12개 마이그레이션
