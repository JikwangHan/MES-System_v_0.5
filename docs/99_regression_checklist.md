# 회귀 테스트 체크리스트 (권한/초기화/기간/빌드/E2E 실행)

## 1. 권한 흐름
- USER / 업체관리자: `/app/admin/companies`, `/app/admin/users` 직접 입력 → 모달 1회 표시 후 토큰 삭제 + 홈 이동 확인(로컬 스토리지에서 access_token 삭제됨 확인).
- COMPANY_ADMIN: `/app/admin/users` 접근 가능, `/app/admin/companies` 접근 차단(모달 1회).
- SYSTEM_ADMIN: 두 경로 모두 정상 진입.

## 2. 회사 코드 동기화
- SYSTEM_ADMIN: 업체 ALL→특정 업체→ALL 전환 시 수주/재고/작업지시/설비/업체/사용자 화면이 즉시 재조회·초기화되는지 확인.
- COMPANY_ADMIN/USER: 초기화 시 본인 업체 데이터만 유지되는지 확인.

## 3. 초기화/버튼 회귀
- 모든 화면(수주/재고/작업지시/설비/업체/사용자): 검색→새로고침→초기화 후 입력/선택값이 비워지고 기본 조회로 복귀하는지 확인.
- 버튼 정렬/크기: 검색·새로고침·초기화(+추가/수정/삭제) 폭 96px, 높이 32px 동일 여부 확인.

## 4. 대시보드 기간 반응
- 기간(오늘/최근7일/최근30일) 전환 시 KPI·차트·리스트가 기간에 맞게 변하는지 확인(더미 데이터 날짜 분포 포함).

## 5. E2E 실행 방법(로컬/CI 공통)
- 환경 변수 설정(예: PowerShell)
  - `CYPRESS_USER_ID`, `CYPRESS_USER_PW` : 권한 차단/토큰 테스트용 일반 사용자
  - `CYPRESS_COMPANY_ADMIN_ID`, `CYPRESS_COMPANY_ADMIN_PW` : 회사 관리자용 계정
  - `CYPRESS_ADMIN_ID`, `CYPRESS_ADMIN_PW` : 시스템 관리자 계정
- 실행 명령: `cd client && npm run cy:run` (14개 스펙 기준)
- 스펙 목록(존재/표시 위주, 데이터 변경 없음)
  - auth_block, dashboard_period, search_reset, smoke_all_pages
  - admin_basic, equipment_basic, inventory_basic, orders_basic, work_basic
  - crud_modal_smoke, crud_presence, tenant_filter_presence
  - permissions_roles, token_invalid_redirect
- 실행 후 생성되는 `cypress/screenshots` / `cypress/videos` 는 필요 시 삭제 후 커밋.

## 6. 빌드/상태
- `npm run build` (server, client) 성공 여부 확인.
- `git status` 확인 → 문제 없으면 커밋/푸시로 상태 동결.
