# MES-System v0.5 화면별 상세 설계서 (최종 보완본)
- 기준 문서: 2025년 MES 웹서버 사용설명서(PDF), MES_WebServer_UIUX_design_v0_2.docx, 프론트엔드 디자인/구현 계획(02_frontend_design_plan.md), 선행 정리본(SCR-0001~0003 docx), **MES_UIUX_SCR-0001-0049_상세설계_v1_0_RevA.md**(모두 적용)
- 범위: SCR-0001 ~ SCR-0049 전체 화면
- 목적: UI/UX·기능·API·권한·로그·테스트를 일관 템플릿으로 통합하고, RevA의 보안/멀티테넌트/로그/오류코드/테스트 패턴을 전면 반영
- 관리자 기본 계정: admin / admin123 (최초 로그인 시 비밀번호 변경 강제)

## 공통 규칙 (RevA 통합)
- 멀티테넌트/DB 라우팅: 토큰의 `tenantId`(또는 companyCode)로 DB/스키마 선택. SystemAdmin은 기업 선택 필터 노출, 이외는 고정.
- 보안/암호화: HTTPS, 비밀번호 Argon2id 또는 bcrypt, PII 컬럼 AES-256-GCM, 화면 표시 시 PII 마스킹. 감사 로그는 before/after 해시 저장.
- 원시 로그(설비 연동): 별도 저장소, 기본 30일 보관, 기간·페이징 조회 제공.
- API 공통: 모든 목록 API `companyCode` 쿼리 포함, 응답 `{ items: [], total }`, 페이지네이션 `page`(1부터)/`pageSize`, 날짜 필터 `from/to`(또는 `dueFrom/dueTo`). 표준 오류코드 400/401/403/409/423/500 사용.
- 표준 역할: SystemAdmin(전체), TenantAdmin(자사), Manager(승인·통제), Operator(입력), Viewer(조회). 화면 권한은 RevA 테이블 우선.
- 표준 버튼 시퀀스(목록형): 조회 → 초기화 → 추가 → 변경 → 삭제 → 엑셀다운. 권한·선택·검증을 사전 체크, 성공 시 재조회·행 강조, 실패 시 메시지/포커스 이동.
- 표준 테스트 케이스(RevA): TC-SCR-XXXX-01 기본 렌더링, -02 조회/검색, -03 권한, -04 로그, -05 오류/복구. 도메인별 추가(예: 로그인 잠금, 상태 전환, 강제 비밀번호 변경 등)는 RevA의 추가 TC를 그대로 적용.
- 로그/감사: `ui.view.scr-XXXX`(INFO, 180일), `data.mutation`(등록/변경/삭제, 365일, 해시 저장), `admin.action`(WARN, 730일, PII 마스킹), 인증 관련 `auth.login.*`, 암호 관련 `auth.password.change`. 마스킹 규칙은 RevA 준용.

## 라우트 · 화면 ID 매핑 (동일)
| 화면 ID | 라우트(권장) | 화면명/카테고리 |
|---|---|---|
| SCR-0001 | /main (또는 /login) | 메인 진입 / 공통 |
| SCR-0002 | /login | 로그인 / 공통 |
| SCR-0003 | /account/change-password | 암호변경 / 공통 |
| SCR-0004 | /dashboard/production | 현황판(시간당 생산량) / 대시보드 |
| SCR-0005 | /calendar | 일정달력 / 대시보드 |
| SCR-0006 | /calendar (modal:add) | 일정 추가 팝업 |
| SCR-0007 | /calendar (context) | 일정 우클릭 메뉴 |
| SCR-0008 | /orders/summary | 수주현황 / 수주 |
| SCR-0009 | /orders | 수주내역·납품/반품 / 수주 |
| SCR-0010 | /orders (modal:add) | 수주내역 추가 |
| SCR-0011 | /orders (modal:edit) | 수주내역 변경 |
| SCR-0012 | /deliveries | 납품내역 |
| SCR-0013 | /deliveries (modal:add) | 납품내역 추가 |
| SCR-0014 | /returns | 반품내역 관리 |
| SCR-0015 | /returns (modal:add) | 반품내역 추가 |
| SCR-0016 | /work/status | 작업현황 |
| SCR-0017 | /work/orders | 작업관리 |
| SCR-0018 | /work/orders (modal:add) | 작업관리 추가 |
| SCR-0019 | /work/orders/process | 작업분배/공정 |
| SCR-0020 | /work/jobs | 작업지시 |
| SCR-0021 | /work/jobs (modal:add) | 작업지시 추가 |
| SCR-0022 | /master/items | 품목내역·BOM |
| SCR-0023 | /master/items (modal:add) | 품목내역 추가 |
| SCR-0024 | /master/items/process | BOM/공정 연결 |
| SCR-0025 | /master/item-types | 품목유형 |
| SCR-0026 | /master/item-types (modal:add) | 품목유형 추가 |
| SCR-0027 | /master/processes | 작업공정 |
| SCR-0028 | /master/processes (modal:add) | 작업공정 추가 |
| SCR-0029 | /inventory/status | 재고현황 |
| SCR-0030 | /inventory/inbound | 입고내역 |
| SCR-0031 | /inventory/inbound (modal:add) | 입고내역 추가 |
| SCR-0032 | /inventory/outbound | 출고내역 |
| SCR-0033 | /inventory/requirements | 소요산출 |
| SCR-0034 | /inventory/requirements/result | 소요산출 결과 |
| SCR-0035 | /quality/defects/status | 불량현황 |
| SCR-0036 | /quality/defects | 불량내역 |
| SCR-0037 | /quality/defect-types | 불량유형 |
| SCR-0038 | /equipment/status | 설비현황 |
| SCR-0039 | /equipment/monitoring | 모니터링 현황 |
| SCR-0040 | /equipment | 설비등록 |
| SCR-0041 | /equipment (modal:add) | 설비등록 추가 |
| SCR-0042 | /admin/users | 사용자 |
| SCR-0043 | /admin/permissions | 사용자권한 |
| SCR-0044 | /admin/responsibles (modal:assign) | 업무 담당자 설정 |
| SCR-0045 | /admin/responsibles | 업무 담당자 |
| SCR-0046 | /admin/partners | 거래처 |
| SCR-0047 | /admin/partners (modal:add) | 거래처 추가 |
| SCR-0048 | /admin/factories-warehouses | 생산공장/창고 |
| SCR-0049 | /admin/factories-warehouses (modal:add) | 생산공장/창고 추가 |

## RevA 필수 반영 항목 요약 (모든 화면 공통)
- 입력/필터: `tenantId`(SystemAdmin만), `fromDate/toDate` 최대 1년 권장, `keyword`(0~100자, 특수문자 필터), `status`/`partnerId` 등 RevA 정의 필터 추가.
- 컬럼: PII(주소/연락처 등) 마스킹 + AES 컬럼 암호화 표기, `updatedAt` 기본 컬럼 포함.
- 버튼 시퀀스: 조회/초기화/추가/변경/삭제/엑셀다운을 기본 제공. 선택/권한/검증 체크 후 API 호출, 성공 시 재조회·강조, 실패 시 메시지/포커스.
- API: RevA에 명시된 엔드포인트/오류코드를 우선 적용. 미기재 화면은 표준 CRUD+export 패턴으로 작성.
- 권한: SystemAdmin/TenantAdmin/Manager/Operator/Viewer 행마다 접근·데이터 범위 명시. SystemAdmin만 기업 선택 가능.
- 로그: `ui.view.scr-XXXX`(화면 진입), `auth.login.*`, `auth.password.change`, `data.mutation`, `admin.action` 등 RevA 이벤트명을 사용.
- 테스트: TC-SCR-XXXX-01~05 기본 세트 + 도메인 특화 TC(예: 로그인 잠금, forcePasswordChange, 상태 전환, FIFO/용량·재고 검증 등).

## 주요 화면 보완 포인트 (RevA → 본 문서 반영)
- SCR-0001 메인: 공개 API `GET /api/public/app-config`로 로고/버전/공지 로딩. 로그 `ui.view.scr-0001`, 버튼 감사 이벤트 `audit.ui.open_login/signup`. Dashboard 이동 전 인증 체크.
- SCR-0002 로그인: 입력 `rememberMe` 추가, 비밀번호 정책 8~64자(Argon2id/bcrypt). API 오류코드 AUTH_401/VALIDATION_400/LOCKED_423. 로그인 실패 누적 잠금 TC-SCR-0002-06 반영.
- SCR-0003 암호변경: 비밀번호 정책 10~64자 조합 권장, `auth.password.change` 로그, 데이터 변경 해시 `data.mutation` 적용, 강제 변경 차단 TC 유지.
- SCR-0004 현황판: 필터 fromDate/toDate/keyword/status 적용, 권한 Viewer 이상, 로그 `ui.view.scr-0004`. API `/api/dashboard/production/hourly?fromDate&toDate&itemId?`.
- SCR-0005~0007 일정: 기간/모드 필터에 `tenantId` 옵션 추가, 권한 있는 사용자만 추가/편집/삭제, audit.create/update/delete 적용.
- SCR-0008~0015 수주/납품/반품: 모든 목록에 `tenantId/from/to/keyword/status` 필터 및 표준 버튼 시퀀스 반영. API 오류코드 400/401/403/409/500 명시. 로그 `data.mutation`, `ui.view.scr-XXXX`.
- SCR-0016~0021 작업/지시: 분배/용량/상태 전환 시 409(CONFLICT) 코드 활용, 자동분배 실패 처리. 테스트에 용량 초과/일정 역전/상태 전환 규칙 추가.
- SCR-0022~0028 품목/BOM/공정: 코드 중복(CONFLICT_409) 명시, 순서/표준시간 검증, 삭제 시 참조 무결성 오류 안내. PII 없음.
- SCR-0029~0034 재고/입출고/소요산출: 주소/창고 위치 등 PII 마스킹, 재고 잔량/로트 FIFO 검증 TC, 산출 결과 이력 조회 포함.
- SCR-0035~0037 품질: 불량유형/불량내역에 상태/심각도(severity) 반영, 코드 중복 409, 불량 수량>0 검증.
- SCR-0038~0039 설비/모니터링: 원시 로그 조회 요구사항 연결, 실시간/새로고침 주기, 알람 표시. 로그 보관 30일 기본.
- SCR-0040~0041 설비등록: 코드 중복/사용중 삭제 제한, 설치일 미래 차단, PII(설비 위치/주소) 마스킹·암호화 표기.
- SCR-0042~0045 사용자/권한/업무담당: 기업 선택 필터(SystemAdmin), 권한 매트릭스, 비밀번호 초기화 시 admin.action 로그, 역할 최소 1개 유지.
- SCR-0046~0049 거래처/공장창고: 필터/PII 마스킹/기업 선택/표준 버튼·API·로그·테스트를 RevA 표대로 반영. 주소는 AES 컬럼 암호화, `admin.action` 로그 적용.

## 앞으로 진행해야 할 작업
1) 화면별 섹션에 RevA 필터/버튼/로그/테스트 세트 삽입: `tenantId/fromDate/toDate/keyword/status`, 표준 버튼 표, 표준 테스트(TC-SCR-XXXX-01~05)와 도메인 추가 TC를 실제 표 형태로 반영.
2) 각 화면의 API 테이블을 RevA 엔드포인트와 오류코드로 교체 또는 병합(없는 경우 표준 CRUD/Export 패턴 작성).
3) PII 컬럼(주소/연락처 등)에 마스킹·AES-256-GCM 명시, 로그 보관 기간을 RevA 기준(180/365/730일)으로 설정.
4) 권한 표를 RevA 역할 정의로 교체: SystemAdmin 기업 선택 가능, TenantAdmin 자사 고정, Manager/Operator/Viewer 권한 범위 명확화.
5) 테스트 케이스 ID를 RevA 패턴으로 일괄 재번호(TC-SCR-XXXX-0n)하고, 잠금/상태전환/용량/FIFO 등 도메인 특화 케이스 추가.
6) 메뉴 트리/라우트와 실제 네비게이션 컴포넌트 매핑 재점검하여 경로/권한 불일치 제거.

---
## SCR-0001 메인 진입 (RevA 반영)
| 항목 | 내용 |
|---|---|
| 화면 ID | SCR-0001 |
| 기준 라우트 | /login |
| 프로젝트 라우트 | /main (권장) 및 /login(호환) |
| 목적 | 시스템 소개/진입, 상단 Dashboard/Signup/Login 링크 제공 |
| 비고 | 익명 허용 |

- 진입 조건: 브라우저 접속, 인증 무관(공개)
- 레이아웃: antd Layout + Header 링크(Dashboard/Signup/Login), Footer(회사명, About Us, MES License, EMS v0.5)
- 버튼/동작
| 버튼/메뉴 | 사전 검증 | 호출/라우팅 | 성공 | 실패 | 감사 로그 |
|---|---|---|---|---|---|
| Login | 없음 | 모달 열기 | 로그인 모달 표시 | - | audit.ui.open_login |
| 회원가입 | 없음 | 모달 열기 | 회원가입 모달 표시 | - | audit.ui.open_signup |
| Dashboard | 인증 확인 | /app/dashboard | 대시보드 이동 | 로그인 필요 안내 | audit.nav.dashboard |
| About Us | 없음 | /about | 소개 페이지 표시 | - | audit.nav.about |

API
| 메서드 | 경로 | 인증 | 오류코드 |
|---|---|---|---|
| GET | /api/public/app-config | Public | 500 |
| GET | /auth/me | Optional JWT | 401,500 |

권한
| 역할 | 접근 | 데이터 범위 |
|---|---|---|
| Public | 허용 | 해당 없음 |
| 로그인 사용자 | 허용 | 본인 세션 |

로그/보관
| 이벤트 | 레벨 | 필드 | 보관 |
|---|---|---|---|
| ui.view.scr-0001 | INFO | userId(마스킹), tenantId, route, clientIp | 180일 |
| audit.ui.open_login/signup | INFO | userId, tenantId | 180일 |
| audit.nav.dashboard/about | INFO | userId, tenantId, targetRoute | 180일 |

테스트
| TC ID | 시나리오 | 기대 결과 |
|---|---|---|
| TC-SCR-0001-01 | 기본 렌더링 | 요소 정상 표시 |
| TC-SCR-0001-02 | Dashboard 클릭(미인증) | 로그인 모달/리다이렉트 |
| TC-SCR-0001-03 | 로그아웃 | 버튼 전환, 토큰 삭제 |
| TC-SCR-0001-04 | 로그 기록 | ui.view/audit 로그 남김 |
| TC-SCR-0001-05 | 에러/복구 | API 500 시 안내·재시도 |

---
## SCR-0002 로그인 (RevA 반영)
| 항목 | 내용 |
|---|---|
| 화면 ID | SCR-0002 |
| 기준 라우트 | /login |
| 프로젝트 라우트 | /login (모달 또는 페이지) |
| 목적 | ID/비밀번호 로그인, 실패 횟수/잠금, 강제 암호변경 처리 |
| 비고 | I-LOGIN |

입력/필터
| 필드 | 타입 | 필수 | 검증 | 기본 | 저장/암호화 |
|---|---|---|---|---|---|
| userId | Text | Y | 4~32 영문/숫자/밑줄 | '' | 저장 없음 |
| password | Password | Y | 8~64 | '' | Argon2/bcrypt(서버) |
| rememberMe | Checkbox | N | - | false | RefreshToken 사용 |
| companyCode | Text | N | 멀티테넌트 옵션 | '' | 저장 없음 |

버튼/동작
| 버튼 | 사전 검증 | API/라우팅 | 성공 | 실패 | 감사 로그 |
|---|---|---|---|---|---|
| 로그인 | 필수값/정책 | POST /api/auth/login | 토큰 저장, /dashboard 또는 /account/change-password | 오류 메시지, 실패횟수 증가 | auth.login.attempt/success/fail |
| 회원가입 | 없음 | 모달 전환 | 폼 표시 | - | audit.ui.switch_to_signup |
| 닫기 | 없음 | 모달 닫기 | 닫힘 | - | audit.ui.close_modal |

API
| 메서드 | 경로 | 인증 | 오류코드 |
|---|---|---|---|
| POST | /api/auth/login | Public | 400,401,423,500 |
| GET | /api/auth/me | JWT | 401,500 |
| POST | /api/auth/signup | Public/초대 | 400,409,500 |

권한
| 역할 | 접근 | 데이터 |
|---|---|---|
| Public | 허용 | 해당 없음 |
| 로그인 사용자 | 접근 시 /dashboard 리다이렉트 | 본인 |

로그/보관
| 이벤트 | 레벨 | 필드 | 보관 |
|---|---|---|---|
| ui.view.scr-0002 | INFO | userId(마스킹), tenantId, route, clientIp | 180일 |
| auth.login.attempt/success/fail | INFO/WARN | userId(마스킹), reason, failedCount | 365일 |
| ACCOUNT_LOCKED | WARN | userId, lockedUntil | 365일 |

테스트
| TC ID | 시나리오 | 기대 결과 |
|---|---|---|
| TC-SCR-0002-01 | 기본 렌더링 | 정상 표시 |
| TC-SCR-0002-02 | 정상 로그인 | /dashboard 이동 |
| TC-SCR-0002-03 | 실패 누적 | 실패횟수 증가 |
| TC-SCR-0002-04 | 계정 잠금 | 423 안내 |
| TC-SCR-0002-05 | 강제 비번변경 | /account/change-password 이동 |
| TC-SCR-0002-06 | 로그/복구 | 로그 남김, 500 안내 |

---
## SCR-0003 암호변경 (RevA 반영)
| 항목 | 내용 |
|---|---|
| 화면 ID | SCR-0003 |
| 기준/프로젝트 라우트 | /account/change-password |
| 목적 | 강제/사용자 요청 비밀번호 변경 |
| 비고 | I-PWD-CHANGE |

입력
| 필드 | 타입 | 필수 | 검증 | 저장/암호화 |
|---|---|---|---|---|
| currentPassword | Password | Y | 일치 여부 | 해시 비교 |
| newPassword | Password | Y | 10~64, 조합 권장 | 해시 저장 |
| confirmPassword | Password | Y | new와 동일 | 저장 없음 |

버튼/동작
| 버튼 | 사전 검증 | API | 성공 | 실패 | 감사 로그 |
|---|---|---|---|---|---|
| 변경 | 일치/정책 | POST /api/auth/change-password | 성공 메시지, /dashboard, forceFlag 해제 | 오류 안내 | auth.password.change, data.mutation |
| 취소 | 강제 시 비활성 | - | 이전 화면 | 강제 상태면 차단 | audit.ui.close_modal |

API
| 메서드 | 경로 | 인증 | 오류코드 |
|---|---|---|---|
| POST | /api/auth/change-password | JWT | 400,401,500 |
| GET | /api/auth/me | JWT | 401,500 |

권한
| 역할 | 접근 | 데이터 |
|---|---|---|
| 로그인 사용자 | 허용 | 본인 |
| 익명 | 거부 | - |

로그/보관
| 이벤트 | 레벨 | 필드 | 보관 |
|---|---|---|---|
| ui.view.scr-0003 | INFO | userId(마스킹), tenantId, route, clientIp | 180일 |
| auth.password.change | INFO | userId, result | 365일 |
| data.mutation | INFO | entity, beforeHash, afterHash | 365일 |

테스트
| TC ID | 시나리오 | 기대 결과 |
|---|---|---|
| TC-SCR-0003-01 | 기본 렌더링 | 정상 표시 |
| TC-SCR-0003-02 | 정상 변경 | 대시보드 이동, flag 해제 |
| TC-SCR-0003-03 | 불일치 입력 | 클라이언트 차단 |
| TC-SCR-0003-04 | 정책 위반 | 400 안내 |
| TC-SCR-0003-05 | 로그/복구 | 로그 남김, 500 안내 |

---
## SCR-0004 현황판 (시간당 생산량) RevA 반영
| 항목 | 내용 |
|---|---|
| 화면 ID | SCR-0004 |
| 라우트 | /dashboard/production |
| 목적 | 시간당 생산/불량 그래프 + 하단 작업 리스트 |
| 비고 | 조회 전용, 필터 기반 |

입력/필터
| 필드 | 타입 | 필수 | 검증 | 기본 | 비고 |
|---|---|---|---|---|---|
| fromDate | Date | N | toDate 이전, 최대 1년 | 오늘-30일 | 조회 시작 |
| toDate | Date | N | fromDate 이후 | 오늘 | 조회 종료 |
| factoryId | Select | N | 존재 값 | 사용자 기본 | |
| lineId | Select | N | 존재 값 | 전체 | |
| itemId | Select | N | 존재 값 | 전체 | |
| status | Select | N | ENUM | 전체 | 진행상태 |

버튼/동작
| 트리거 | 사전 검증 | API | 성공 | 실패 | 로그 |
|---|---|---|---|---|---|
| 화면 진입/필터 변경 | 날짜/필터 | GET /api/dashboard/production/hourly | 차트·리스트 갱신 | 안내·재시도 | ui.view.scr-0004 |
| 새로고침 | 기존 조건 | 동일 | 데이터 재로드 | 동일 | audit.view |

API
| 메서드 | 경로 | 인증 | 오류코드 |
|---|---|---|---|
| GET | /api/dashboard/production/hourly?fromDate&toDate&factoryId?&lineId?&itemId? | JWT | 400,401,403,500 |

권한
| 역할 | 접근 | 범위 |
|---|---|---|
| Viewer 이상 | 허용 | 기업 고정 |
| SystemAdmin | 허용 | 기업 선택 가능 |

로그/보관
| 이벤트 | 레벨 | 필드 | 보관 |
|---|---|---|---|
| ui.view.scr-0004 | INFO | userId(마스킹), tenantId, route | 180일 |
| DASHBOARD_API_ERROR | WARN | errorCode, traceId | 90일 |

테스트
| TC ID | 시나리오 | 기대 결과 |
|---|---|---|
| TC-SCR-0004-01 | 기본 렌더링 | 차트/리스트 표시 |
| TC-SCR-0004-02 | 필터 조회 | 조건 반영 갱신 |
| TC-SCR-0004-03 | 권한 차단 | 미인증 401 리다이렉트 |
| TC-SCR-0004-04 | 빈 데이터 | “데이터 없음” 표시 |
| TC-SCR-0004-05 | 오류/복구 | 500 시 안내·재시도 |

---
## SCR-0005 일정달력 RevA 반영
| 항목 | 내용 |
|---|---|
| 화면 ID | SCR-0005 |
| 라우트 | /calendar |
| 목적 | 수주/작업 일정 조회 및 관리 |

입력/필터
| 필드 | 타입 | 필수 | 검증 | 기본 | 비고 |
|---|---|---|---|---|---|
| from | Date | Y | to 이후 불가 | 이번달 1일 | 기간 시작 |
| to | Date | Y | from 이전 불가 | 이번달 말 | 기간 종료 |
| viewMode | Enum(month/week/day) | N | ENUM | month | 보기 모드 |

버튼/동작
| 트리거 | 사전 검증 | API | 성공 | 실패 | 로그 |
|---|---|---|---|---|---|
| 화면 진입/필터 변경 | 날짜 유효 | GET /api/calendar?from&to | 이벤트 표시 | 안내/재시도 | ui.view.scr-0005 |
| 날짜 드래그/더블클릭 | 권한 | - (팝업) | SCR-0006 팝업 열기 | 권한 부족 안내 | audit.ui.open_modal |
| 이벤트 우클릭 | 권한 | - | SCR-0007 메뉴 표시 | 권한 부족 안내 | audit.ui.context_menu |

API
| 메서드 | 경로 | 인증 | 오류코드 |
|---|---|---|---|
| GET | /api/calendar?from&to | JWT | 400,401,403,500 |

권한
| 역할 | 접근 | 기능 |
|---|---|---|
| Viewer 이상 | 조회 | 조회 |
| Manager/Operator | 생성/수정/삭제 | 팝업/컨텍스트 |

로그/보관
| 이벤트 | 레벨 | 필드 | 보관 |
|---|---|---|---|
| ui.view.scr-0005 | INFO | userId, tenantId, route | 180일 |
| audit.ui.open_modal/context_menu | INFO | userId, targetId | 180일 |

테스트
| TC ID | 시나리오 | 기대 결과 |
|---|---|---|
| TC-SCR-0005-01 | 기본 렌더링 | 캘린더 로드 |
| TC-SCR-0005-02 | 기간 변경 | 이벤트 재조회 |
| TC-SCR-0005-03 | 권한 없는 추가 | 차단 안내 |
| TC-SCR-0005-04 | 로그 기록 | ui.view/audit 로그 |
| TC-SCR-0005-05 | 오류/복구 | 500 안내·재시도 |

---
## SCR-0006 일정 추가 팝업 RevA 반영
| 항목 | 내용 |
|---|---|
| 화면 ID | SCR-0006 |
| 라우트 | /calendar (modal:add) |
| 목적 | 일정 생성/수정 |

입력
| 필드 | 타입 | 필수 | 검증 | 비고 |
|---|---|---|---|---|
| title | Text | Y | 1~100 | 제목 |
| type | Enum(수주/작업/공지) | Y | ENUM | 유형 |
| start | Datetime | Y | end 이후 불가 | 시작 |
| end | Datetime | Y | start 이전 불가 | 종료 |
| orderNo/jobNo | Text | N | 존재 검증 | 연계 |
| memo | Text | N | 0~500 | |

버튼/동작
| 버튼 | 검증 | API | 성공 | 실패 | 로그 |
|---|---|---|---|---|---|
| 저장 | 필수/시간 | POST /api/calendar | 이벤트 추가·닫기 | 오류 메시지 | audit.create |
| 수정 | 필수/시간 | PUT /api/calendar/{id} | 갱신·닫기 | 오류 메시지 | audit.update |
| 삭제 | 권한 | DELETE /api/calendar/{id} | 제거·닫기 | 권한/충돌 안내 | audit.delete |
| 취소 | - | - | 닫기 | - | audit.ui.close_modal |

API
| 메서드 | 경로 | 인증 | 오류코드 |
|---|---|---|---|
| POST | /api/calendar | JWT | 400,401,403,500 |
| PUT | /api/calendar/{id} | JWT | 400,401,403,500 |
| DELETE | /api/calendar/{id} | JWT | 401,403,409,500 |

권한
| 역할 | 기능 |
|---|---|
| Manager/Operator | 생성/수정/삭제 |
| Viewer | 불가 |

로그/보관
| 이벤트 | 레벨 | 필드 | 보관 |
|---|---|---|---|
| audit.create/update/delete | INFO | userId, eventId | 365일 |

테스트
| TC ID | 시나리오 | 기대 결과 |
|---|---|---|
| TC-SCR-0006-01 | 저장 | 이벤트 추가 |
| TC-SCR-0006-02 | 시간 역전 | 클라이언트 차단 |
| TC-SCR-0006-03 | 권한 없는 삭제 | 403 안내 |
| TC-SCR-0006-04 | 로그 기록 | audit.* 남김 |
| TC-SCR-0006-05 | 오류/복구 | 500 안내·재시도 |

---
## SCR-0007 일정 우클릭 메뉴 RevA 반영
| 항목 | 내용 |
|---|---|
| 화면 ID | SCR-0007 |
| 라우트 | /calendar (context) |
| 목적 | 일정 컨텍스트 메뉴(열기/편집/복제/삭제/상태변경) |

버튼/동작
| 메뉴 | 검증 | API | 성공 | 실패 | 로그 |
|---|---|---|---|---|---|
| 열기/편집 | 권한 | - (모달) | 팝업 열기 | 권한 안내 | audit.ui.context_menu |
| 복제 | 권한 | POST /api/calendar/{id}/clone | 새 이벤트 생성 | 안내 | audit.create |
| 삭제 | 권한 | DELETE /api/calendar/{id} | 제거 | 권한/충돌 안내 | audit.delete |
| 상태변경 | 권한 | PATCH /api/calendar/{id}/status | 상태 갱신 | 오류 안내 | audit.update |

API
| 메서드 | 경로 | 인증 | 오류코드 |
|---|---|---|---|
| POST | /api/calendar/{id}/clone | JWT | 401,403,500 |
| PATCH | /api/calendar/{id}/status | JWT | 400,401,403,500 |

권한
| 역할 | 기능 |
|---|---|
| Manager/Operator | 편집/삭제/상태 |
| Viewer | 조회만 |

로그/보관
| 이벤트 | 레벨 | 필드 | 보관 |
|---|---|---|---|
| audit.ui.context_menu | INFO | userId, eventId | 180일 |
| audit.create/update/delete | INFO | userId, eventId | 365일 |

테스트
| TC ID | 시나리오 | 기대 결과 |
|---|---|---|
| TC-SCR-0007-01 | 컨텍스트 메뉴 표시 | 권한 시 메뉴 노출 |
| TC-SCR-0007-02 | 복제 실행 | 새 이벤트 생성 |
| TC-SCR-0007-03 | 삭제 권한 없음 | 403 안내 |
| TC-SCR-0007-04 | 상태변경 | 즉시 반영 |
| TC-SCR-0007-05 | 로그/복구 | 로그 남김, 500 안내 |

---
## SCR-0008 수주현황 RevA 반영
| 항목 | 내용 |
|---|---|
| 화면 ID | SCR-0008 |
| 라우트 | /orders/summary |
| 목적 | 수주 현황 조회(요약/차트/리스트) |

입력/필터
| 필드 | 타입 | 필수 | 검증 | 기본 | 비고 |
|---|---|---|---|---|---|
| fromDate | Date | N | toDate 이전 | 오늘-30일 | 기간 시작 |
| toDate | Date | N | fromDate 이후 | 오늘 | 기간 종료 |
| customerId | Select | N | 존재 값 | 전체 | 거래처 |
| itemId | Select | N | 존재 값 | 전체 | 품목 |
| status | Select(접수/확정/취소) | N | ENUM | 전체 | 상태 |
| keyword | Text | N | 0~100 | '' | 통합검색 |

버튼/동작
| 트리거 | 검증 | API | 성공 | 실패 | 로그 |
|---|---|---|---|---|---|
| 조회/필터 | 유효성 | GET /api/orders/summary | 요약/리스트 갱신 | 안내·재시도 | ui.view.scr-0008 |
| 엑셀다운 | 조회결과 | GET /api/orders/summary/export | 파일 다운로드 | 오류 안내 | audit.export |

API
| 메서드 | 경로 | 인증 | 오류코드 |
|---|---|---|---|
| GET | /api/orders/summary?fromDate&toDate&customerId?&itemId?&status?&keyword? | JWT | 400,401,403,500 |
| GET | /api/orders/summary/export | JWT | 400,401,403,500 |

권한
| 역할 | 접근 | 범위 |
|---|---|---|
| Viewer 이상 | 허용 | 기업 고정 |
| SystemAdmin | 허용 | 기업 선택 |

로그/보관
| 이벤트 | 레벨 | 필드 | 보관 |
|---|---|---|---|
| ui.view.scr-0008 | INFO | userId, tenantId, filters | 180일 |
| audit.export | INFO | userId, range | 365일 |

테스트
| TC ID | 시나리오 | 기대 결과 |
|---|---|---|
| TC-SCR-0008-01 | 기본 렌더링 | 요약/리스트 표시 |
| TC-SCR-0008-02 | 필터 조회 | 조건 반영 |
| TC-SCR-0008-03 | 권한 차단 | 401/403 처리 |
| TC-SCR-0008-04 | 엑셀다운 | 파일 다운로드 |
| TC-SCR-0008-05 | 오류/복구 | 500 안내·재시도 |

---
## SCR-0009 수주내역·납품/반품 RevA 반영
| 항목 | 내용 |
|---|---|
| 화면 ID | SCR-0009 |
| 라우트 | /orders |
| 목적 | 수주내역과 납품/반품 연계 조회 |

입력/필터
| 필드 | 타입 | 필수 | 검증 | 기본 |
|---|---|---|---|---|
| fromDate/toDate | Date | N | 범위 유효 | 최근 30일 |
| customerId | Select | N | 존재 값 | 전체 |
| itemId | Select | N | 존재 값 | 전체 |
| status | Select | N | ENUM | 전체 |
| keyword | Text | N | 0~100 | '' |

그리드(G-ORDER-LIST)
| 컬럼 | 타입 | 비고 |
|---|---|---|
| orderNo | Text | 수주번호 |
| lineNo | Text | 라인번호 |
| customer | Text | 거래처 |
| item | Text | 품목 |
| qty | Number | 수량 |
| unitPrice | Number | 단가 |
| amount | Number | 금액 |
| dueDate | Date | 납기 |
| deliveryQty | Number | 납품수량 |
| returnQty | Number | 반품수량 |
| status | Enum | 상태 |

버튼/동작
| 버튼 | 검증 | API | 성공 | 실패 | 로그 |
|---|---|---|---|---|---|
| 조회 | 필터 | GET /api/orders | 리스트 갱신 | 안내 | ui.view.scr-0009 |
| 추가 | 권한 | 모달(0010) | 팝업 | 권한 안내 | audit.ui.open_modal |
| 수정 | 선택/권한 | 모달(0011) | 팝업 | 안내 | audit.ui.open_modal |
| 삭제 | 선택/권한 | DELETE /api/orders/{id} | 재조회 | 403/409 안내 | audit.delete |
| 납품연결 | 선택 | GET /api/deliveries?orderId | 팝업/탭 표시 | 안내 | audit.view |
| 반품연결 | 선택 | GET /api/returns?orderId | 팝업/탭 표시 | 안내 | audit.view |
| 엑셀다운 | 조회결과 | GET /api/orders/export | 다운로드 | 안내 | audit.export |

API
| 메서드 | 경로 | 인증 | 오류코드 |
|---|---|---|---|
| GET | /api/orders | JWT | 400,401,403,500 |
| DELETE | /api/orders/{id} | JWT | 401,403,409,500 |
| GET | /api/deliveries?orderId | JWT | 400,401,403,500 |
| GET | /api/returns?orderId | JWT | 400,401,403,500 |
| GET | /api/orders/export | JWT | 400,401,403,500 |

권한
| 역할 | 기능 |
|---|---|
| Viewer 이상 | 조회 |
| Manager 이상 | 추가/수정/삭제 |

로그/보관
| 이벤트 | 레벨 | 보관 |
|---|---|---|
| ui.view.scr-0009 | INFO | 180일 |
| audit.create/update/delete/export | INFO | 365일 |

테스트
| TC ID | 시나리오 | 기대 결과 |
|---|---|---|
| TC-SCR-0009-01 | 기본 렌더링 | 리스트 표시 |
| TC-SCR-0009-02 | 필터 조회 | 조건 반영 |
| TC-SCR-0009-03 | 삭제 권한/충돌 | 403/409 안내 |
| TC-SCR-0009-04 | 납품/반품 연계 조회 | 연계 데이터 표시 |
| TC-SCR-0009-05 | 오류/복구 | 500 안내·재시도 |

---
## SCR-0010 수주내역 추가 RevA 반영
| 항목 | 내용 |
|---|---|
| 화면 ID | SCR-0010 |
| 라우트 | /orders (modal:add) |
| 목적 | 수주 추가 |

입력(I-ORDER)
| 필드 | 타입 | 필수 | 검증 |
|---|---|---|---|
| customerId | Select | Y | 존재 값 |
| orderDate | Date | Y | - |
| dueDate | Date | Y | orderDate 이후 |
| itemId | Select | Y | 존재 값 |
| qty | Number | Y | >0 |
| unitPrice | Number | Y | >=0 |
| currency | Select | N | ENUM |
| tax | Number | N | 0~100 |
| manager | Select | N | 존재 값 |
| memo | Text | N | 0~500 |

버튼/동작
| 버튼 | 검증 | API | 성공 | 실패 | 로그 |
|---|---|---|---|---|---|
| 저장 | 필수/숫자 | POST /api/orders | 리스트 반영 | 오류 안내 | audit.create |
| 취소 | - | - | 닫기 | - | audit.ui.close_modal |

권한
| 역할 | 기능 |
|---|---|
| Manager 이상 | 저장 |
| Viewer | 불가 |

테스트
| TC ID | 시나리오 | 기대 결과 |
|---|---|---|
| TC-SCR-0010-01 | 저장 | 신규 수주 추가 |
| TC-SCR-0010-02 | 필수 누락/금액 오류 | 클라이언트 차단 |
| TC-SCR-0010-03 | 권한 없음 | 403 안내 |
| TC-SCR-0010-04 | 오류/복구 | 500 안내·재시도 |

---
## SCR-0011 수주내역 변경 RevA 반영
| 항목 | 내용 |
|---|---|
| 화면 ID | SCR-0011 |
| 라우트 | /orders (modal:edit) |
| 목적 | 수주 수정 |

입력: SCR-0010과 동일 + `status` 변경(접수/확정/취소)

버튼/동작
| 버튼 | 검증 | API | 성공 | 실패 | 로그 |
|---|---|---|---|---|---|
| 저장 | 필수/정책 | PUT /api/orders/{id} | 리스트 갱신 | 오류 안내 | audit.update |
| 취소 | - | - | 닫기 | - | audit.ui.close_modal |

권한
| 역할 | 기능 |
|---|---|
| Manager 이상 | 수정 |
| Viewer | 불가 |

테스트
| TC ID | 시나리오 | 기대 결과 |
|---|---|---|
| TC-SCR-0011-01 | 수정 저장 | 갱신 반영 |
| TC-SCR-0011-02 | 상태 전환 규칙 위반 | 서버 409/400 안내 |
| TC-SCR-0011-03 | 권한 없음 | 403 안내 |

---
## SCR-0012 납품내역 RevA 반영
| 항목 | 내용 |
|---|---|
| 화면 ID | SCR-0012 |
| 라우트 | /deliveries |
| 목적 | 납품내역 조회/상태관리 |

필터
| 필드 | 타입 | 필수 | 검증 |
|---|---|---|---|
| fromDate/toDate | Date | N | 범위 |
| customerId | Select | N | 존재 |
| itemId | Select | N | 존재 |
| status | Select(계획/출하/완료) | N | ENUM |
| orderNo | Text | N | 0~100 |

그리드(G-DELIVERY-LIST)
| 컬럼 | 타입 | 비고 |
|---|---|---|
| deliveryNo | Text | 납품번호 |
| orderNo | Text | 수주번호 |
| item | Text | 품목 |
| qty | Number | 수량 |
| shipDate | Date | 출하일 |
| warehouse | Text | 창고 |
| status | Enum | 상태 |

버튼/동작
| 버튼 | 검증 | API | 성공 | 실패 | 로그 |
|---|---|---|---|---|---|
| 조회 | 필터 | GET /api/deliveries | 리스트 갱신 | 안내 | ui.view.scr-0012 |
| 추가 | 권한 | 모달(0013) | 팝업 | 안내 | audit.ui.open_modal |
| 상태변경 | 선택/권한 | PATCH /api/deliveries/{id}/status | 상태 갱신 | 403/409 안내 | audit.update |
| 삭제 | 선택/권한 | DELETE /api/deliveries/{id} | 재조회 | 403/409 안내 | audit.delete |
| 엑셀다운 | 조회결과 | GET /api/deliveries/export | 다운로드 | 안내 | audit.export |

API
| 메서드 | 경로 | 인증 | 오류코드 |
|---|---|---|---|
| GET | /api/deliveries | JWT | 400,401,403,500 |
| PATCH | /api/deliveries/{id}/status | JWT | 400,401,403,409,500 |
| DELETE | /api/deliveries/{id} | JWT | 401,403,409,500 |
| GET | /api/deliveries/export | JWT | 400,401,403,500 |

권한
| 역할 | 기능 |
|---|---|
| Viewer 이상 | 조회 |
| Manager 이상 | 추가/상태/삭제 |

테스트
| TC ID | 시나리오 | 기대 결과 |
|---|---|---|
| TC-SCR-0012-01 | 기본 렌더링 | 리스트 표시 |
| TC-SCR-0012-02 | 필터 조회 | 조건 반영 |
| TC-SCR-0012-03 | 상태 변경 | 상태 갱신 |
| TC-SCR-0012-04 | 권한 없음 | 403 안내 |
| TC-SCR-0012-05 | 오류/복구 | 500 안내·재시도 |

---
## SCR-0013 납품내역 추가 RevA 반영
| 항목 | 내용 |
|---|---|
| 화면 ID | SCR-0013 |
| 라우트 | /deliveries (modal:add) |
| 목적 | 납품 추가 |

입력(I-DELIVERY)
| 필드 | 타입 | 필수 | 검증 |
|---|---|---|---|
| orderNo | Text/Select | Y | 존재/잔량 |
| deliveryDate | Date | Y | - |
| itemId | Select | Y | 존재 |
| qty | Number | Y | >0, 잔량 초과 금지 |
| warehouse | Select | Y | 존재 |
| vehicle/info | Text | N | 0~200 |
| memo | Text | N | 0~500 |

버튼/동작
| 버튼 | 검증 | API | 성공 | 실패 | 로그 |
|---|---|---|---|---|---|
| 저장 | 필수/수량 | POST /api/deliveries | 리스트 반영 | 오류 안내 | audit.create |
| 취소 | - | - | 닫기 | - | audit.ui.close_modal |

권한: Manager 이상 저장

테스트: 잔량 초과 차단, 필수 누락 차단, 권한 없음 403, 500 복구

---
## SCR-0014 반품내역 RevA 반영
| 항목 | 내용 |
|---|---|
| 화면 ID | SCR-0014 |
| 라우트 | /returns |
| 목적 | 반품내역 조회/상태관리 |

필터
| 필드 | 타입 | 필수 | 검증 |
|---|---|---|---|
| fromDate/toDate | Date | N | 범위 |
| customerId | Select | N | 존재 |
| itemId | Select | N | 존재 |
| reasonCode | Select | N | 존재 |
| status | Select(접수/처리중/완료) | N | ENUM |

그리드(G-RETURN-LIST)
| 컬럼 | 타입 | 비고 |
|---|---|---|
| returnNo | Text | 반품번호 |
| orderNo | Text | 수주번호 |
| item | Text | 품목 |
| qty | Number | 수량 |
| reason | Text | 사유 |
| status | Enum | 상태 |
| receivedDate | Date | 접수일 |
| processedDate | Date | 처리일 |

버튼/동작
| 버튼 | 검증 | API | 성공 | 실패 | 로그 |
|---|---|---|---|---|---|
| 조회 | 필터 | GET /api/returns | 리스트 갱신 | 안내 | ui.view.scr-0014 |
| 추가 | 권한 | 모달(0015) | 팝업 | 안내 | audit.ui.open_modal |
| 상태변경 | 선택/권한 | PATCH /api/returns/{id}/status | 상태 갱신 | 403/409 안내 | audit.update |
| 삭제 | 선택/권한 | DELETE /api/returns/{id} | 재조회 | 403/409 안내 | audit.delete |

API
| 메서드 | 경로 | 인증 | 오류코드 |
|---|---|---|---|
| GET | /api/returns | JWT | 400,401,403,500 |
| PATCH | /api/returns/{id}/status | JWT | 400,401,403,409,500 |
| DELETE | /api/returns/{id} | JWT | 401,403,409,500 |

권한
| 역할 | 기능 |
|---|---|
| Viewer 이상 | 조회 |
| Manager 이상 | 추가/상태/삭제 |

테스트
| TC ID | 시나리오 | 기대 결과 |
|---|---|---|
| TC-SCR-0014-01 | 기본 렌더링 | 리스트 표시 |
| TC-SCR-0014-02 | 필터 조회 | 조건 반영 |
| TC-SCR-0014-03 | 상태 변경 | 상태 갱신 |
| TC-SCR-0014-04 | 권한 없음 | 403 안내 |
| TC-SCR-0014-05 | 오류/복구 | 500 안내·재시도 |

---
## SCR-0015 반품내역 추가 RevA 반영
| 항목 | 내용 |
|---|---|
| 화면 ID | SCR-0015 |
| 라우트 | /returns (modal:add) |
| 목적 | 반품 등록 |

입력(I-RETURN)
| 필드 | 타입 | 필수 | 검증 |
|---|---|---|---|
| orderNo | Text/Select | Y | 존재/잔량 |
| itemId | Select | Y | 존재 |
| qty | Number | Y | >0 |
| reasonCode | Select | Y | 존재 |
| receivedDate | Date | Y | - |
| memo | Text | N | 0~500 |
| attachment | File | N | 이미지/문서 | 첨부 |

버튼/동작
| 버튼 | 검증 | API | 성공 | 실패 | 로그 |
|---|---|---|---|---|---|
| 저장 | 필수/수량 | POST /api/returns | 리스트 반영 | 오류 안내 | audit.create |
| 취소 | - | - | 닫기 | - | audit.ui.close_modal |

권한: Manager 이상 저장

테스트: 필수 누락/수량 검증, 권한 없음 403, 첨부 없는 경우 허용, 500 복구

---
## SCR-0016 작업현황 RevA 반영
| 항목 | 내용 |
|---|---|
| 화면 ID | SCR-0016 |
| 라우트 | /work/status |
| 목적 | 작업 현황 요약/차트/리스트 조회 |

필터
| 필드 | 타입 | 필수 | 검증 | 기본 |
|---|---|---|---|---|
| fromDate/toDate | Date | N | 범위 | 최근 7~30일 |
| factoryId | Select | N | 존재 | 사용자 기본 |
| lineId | Select | N | 존재 | 전체 |
| itemId | Select | N | 존재 | 전체 |
| status | Select(대기/진행/완료/중지) | N | ENUM | 전체 |

그리드(G-JOB-LIST)
| 컬럼 | 타입 | 비고 |
|---|---|---|
| jobNo | Text | 작업번호 |
| line | Text | 라인 |
| item | Text | 품목 |
| planQty | Number | 계획 |
| resultQty | Number | 실적 |
| startAt | Datetime | 시작 |
| endAt | Datetime | 종료/진행중 |
| status | Enum | 상태 |
| worker | Text | 작업자 |

버튼/동작
| 트리거 | 검증 | API | 성공 | 실패 | 로그 |
|---|---|---|---|---|---|
| 조회/필터 | 유효성 | GET /api/work/status | 차트/리스트 갱신 | 안내 | ui.view.scr-0016 |
| 새로고침 | - | 동일 | 재조회 | 안내 | audit.view |

API
| 메서드 | 경로 | 인증 | 오류코드 |
|---|---|---|---|
| GET | /api/work/status?fromDate&toDate&factoryId?&lineId?&itemId?&status? | JWT | 400,401,403,500 |

권한
| 역할 | 접근 | 범위 |
|---|---|---|
| Viewer 이상 | 조회 | 기업 고정 |
| SystemAdmin | 조회 | 기업 선택 |

테스트
| TC ID | 시나리오 | 기대 결과 |
|---|---|---|
| TC-SCR-0016-01 | 기본 렌더링 | 차트/리스트 표시 |
| TC-SCR-0016-02 | 필터 조회 | 조건 반영 |
| TC-SCR-0016-03 | 권한 차단 | 401/403 처리 |
| TC-SCR-0016-04 | 빈 데이터 | “데이터 없음” |
| TC-SCR-0016-05 | 오류/복구 | 500 안내·재시도 |

---
## SCR-0017 작업관리 RevA 반영
| 항목 | 내용 |
|---|---|
| 화면 ID | SCR-0017 |
| 라우트 | /work/orders |
| 목적 | 작업관리 목록/상태/분배 전 단계 관리 |

필터
| 필드 | 타입 | 필수 | 검증 |
|---|---|---|---|
| fromDate/toDate | Date | N | 범위 |
| lineId | Select | N | 존재 |
| itemId | Select | N | 존재 |
| status | Select(계획/진행/완료/중지) | N | ENUM |

그리드
| 컬럼 | 타입 | 비고 |
|---|---|---|
| jobNo | Text | 작업번호 |
| orderNo | Text | 수주번호 |
| process | Text | 공정 |
| planQty | Number | 계획수량 |
| issuedQty | Number | 발행수량 |
| status | Enum | 상태 |
| priority | Number | 우선순위 |

버튼/동작
| 버튼 | 검증 | API | 성공 | 실패 | 로그 |
|---|---|---|---|---|---|
| 조회 | 필터 | GET /api/work/orders | 리스트 갱신 | 안내 | ui.view.scr-0017 |
| 추가 | 권한 | 모달(0018) | 팝업 | 안내 | audit.ui.open_modal |
| 분배 | 선택/권한 | /work/orders/process | 화면 이동 | 안내 | audit.nav |
| 지시생성 | 선택/권한 | POST /api/work/orders/{id}/issue | 상태 갱신 | 403/409 안내 | audit.update |
| 삭제 | 선택/권한 | DELETE /api/work/orders/{id} | 재조회 | 403/409 안내 | audit.delete |
| 엑셀다운 | 조회결과 | GET /api/work/orders/export | 다운로드 | 안내 | audit.export |

API
| 메서드 | 경로 | 인증 | 오류코드 |
|---|---|---|---|
| GET | /api/work/orders | JWT | 400,401,403,500 |
| POST | /api/work/orders/{id}/issue | JWT | 400,401,403,409,500 |
| DELETE | /api/work/orders/{id} | JWT | 401,403,409,500 |
| GET | /api/work/orders/export | JWT | 400,401,403,500 |

권한
| 역할 | 기능 |
|---|---|
| Viewer 이상 | 조회 |
| Manager 이상 | 추가/분배/지시/삭제 |

테스트
| TC ID | 시나리오 | 기대 결과 |
|---|---|---|
| TC-SCR-0017-01 | 기본 렌더링 | 리스트 표시 |
| TC-SCR-0017-02 | 필터 조회 | 조건 반영 |
| TC-SCR-0017-03 | 지시 생성 | 상태 갱신 |
| TC-SCR-0017-04 | 삭제 제약 | 409/403 안내 |
| TC-SCR-0017-05 | 오류/복구 | 500 안내·재시도 |

---
## SCR-0018 작업관리 추가 RevA 반영
| 항목 | 내용 |
|---|---|
| 화면 ID | SCR-0018 |
| 라우트 | /work/orders (modal:add) |
| 목적 | 작업관리 추가 |

입력(I-JOB)
| 필드 | 타입 | 필수 | 검증 |
|---|---|---|---|
| orderNo | Text/Select | Y | 존재 |
| process | Select | Y | 존재 |
| line | Select | Y | 존재 |
| planQty | Number | Y | >0 |
| dueDate | Date | Y | - |
| priority | Number | N | >=0 |
| worker | Select | N | 존재 |
| memo | Text | N | 0~500 |

버튼/동작
| 버튼 | 검증 | API | 성공 | 실패 | 로그 |
|---|---|---|---|---|---|
| 저장 | 필수/숫자 | POST /api/work/orders | 리스트 반영 | 오류 안내 | audit.create |
| 취소 | - | - | 닫기 | - | audit.ui.close_modal |

권한: Manager 이상

테스트: 필수/수량 검증, 권한 없음 403, 500 복구

---
## SCR-0019 작업관리 - 공정/분배 RevA 반영
| 항목 | 내용 |
|---|---|
| 화면 ID | SCR-0019 |
| 라우트 | /work/orders/process |
| 목적 | 공정별 작업을 라인/설비에 배분 |

뷰: 좌측 공정 트리, 우측 배분 그리드 {line, equip, capacity, assignedQty, start, end}

버튼/동작
| 버튼 | 검증 | API | 성공 | 실패 | 로그 |
|---|---|---|---|---|---|
| 배분 저장 | 용량/시간 | POST /api/work/orders/{id}/assign | 배분 반영 | 409/검증 안내 | audit.update |
| 자동분배 | 조건 | POST /api/work/orders/{id}/assign/auto | 결과 반영 | 409/검증 안내 | audit.update |
| 취소 | - | - | 화면 복귀 | - | audit.ui.close_modal |

권한
| 역할 | 기능 |
|---|---|
| Manager 이상 | 배분/자동분배 |
| Viewer | 불가 |

테스트
| TC ID | 시나리오 | 기대 결과 |
|---|---|---|
| TC-SCR-0019-01 | 수동 배분 | 배분 저장 |
| TC-SCR-0019-02 | 자동 분배 | 자동 결과 반영 |
| TC-SCR-0019-03 | 용량 초과 | 409 안내 |
| TC-SCR-0019-04 | 권한 없음 | 403 안내 |

---
## SCR-0020 작업지시 RevA 반영
| 항목 | 내용 |
|---|---|
| 화면 ID | SCR-0020 |
| 라우트 | /work/jobs |
| 목적 | 작업지시 조회/상태관리 |

필터
| 필드 | 타입 | 필수 | 검증 |
|---|---|---|---|
| fromDate/toDate | Date | N | 범위 |
| lineId | Select | N | 존재 |
| itemId | Select | N | 존재 |
| status | Select(발행/진행/완료/중지) | N | ENUM |

그리드
| 컬럼 | 타입 | 비고 |
|---|---|---|
| workOrderNo | Text | 지시번호 |
| jobNo | Text | 작업번호 |
| line | Text | 라인 |
| item | Text | 품목 |
| qty | Number | 수량 |
| startPlan/endPlan | Datetime | 계획 |
| status | Enum | 상태 |

버튼/동작
| 버튼 | 검증 | API | 성공 | 실패 | 로그 |
|---|---|---|---|---|---|
| 조회 | 필터 | GET /api/work/jobs | 리스트 갱신 | 안내 | ui.view.scr-0020 |
| 추가 | 권한 | 모달(0021) | 팝업 | 안내 | audit.ui.open_modal |
| 상태변경 | 선택/권한 | PATCH /api/work/jobs/{id}/status | 상태 갱신 | 403/409 안내 | audit.update |
| 삭제 | 선택/권한 | DELETE /api/work/jobs/{id} | 재조회 | 403/409 안내 | audit.delete |
| 엑셀다운 | 조회결과 | GET /api/work/jobs/export | 다운로드 | 안내 | audit.export |

API
| 메서드 | 경로 | 인증 | 오류코드 |
|---|---|---|---|
| GET | /api/work/jobs | JWT | 400,401,403,500 |
| PATCH | /api/work/jobs/{id}/status | JWT | 400,401,403,409,500 |
| DELETE | /api/work/jobs/{id} | JWT | 401,403,409,500 |
| GET | /api/work/jobs/export | JWT | 400,401,403,500 |

권한
| 역할 | 기능 |
|---|---|
| Viewer 이상 | 조회 |
| Manager 이상 | 추가/상태/삭제 |

테스트
| TC ID | 시나리오 | 기대 결과 |
|---|---|---|
| TC-SCR-0020-01 | 기본 렌더링 | 리스트 표시 |
| TC-SCR-0020-02 | 필터 조회 | 조건 반영 |
| TC-SCR-0020-03 | 상태 변경 | 상태 갱신 |
| TC-SCR-0020-04 | 권한 없음 | 403 안내 |
| TC-SCR-0020-05 | 오류/복구 | 500 안내·재시도 |

---
## SCR-0021 작업지시 추가 RevA 반영
| 항목 | 내용 |
|---|---|
| 화면 ID | SCR-0021 |
| 라우트 | /work/jobs (modal:add) |
| 목적 | 작업지시 추가 |

입력(I-WO)
| 필드 | 타입 | 필수 | 검증 |
|---|---|---|---|
| jobNo | Text/Select | Y | 존재 |
| line | Select | Y | 존재 |
| equip | Select | N | 존재 |
| qty | Number | Y | >0 |
| startPlan | Datetime | Y | end 이후 불가 |
| endPlan | Datetime | Y | start 이전 불가 |
| worker | Select | N | 존재 |
| memo | Text | N | 0~500 |

버튼/동작
| 버튼 | 검증 | API | 성공 | 실패 | 로그 |
|---|---|---|---|---|---|
| 저장 | 필수/시간/수량 | POST /api/work/jobs | 리스트 반영 | 오류 안내 | audit.create |
| 취소 | - | - | 닫기 | - | audit.ui.close_modal |

권한: Manager 이상

테스트: 시간 역전 차단, 용량/설비 상태 검증(필요 시), 권한 403, 500 복구

---
## SCR-0022 품목내역·BOM RevA 반영
| 항목 | 내용 |
|---|---|
| 화면 ID | SCR-0022 |
| 라우트 | /master/items |
| 목적 | 품목 기본정보와 BOM 조회/관리 |

필터
| 필드 | 타입 | 필수 | 검증 |
|---|---|---|---|
| itemCode/name | Text | N | 0~100 |
| type | Select | N | 존재 |
| useYn | Select(Y/N) | N | ENUM |

그리드(G-ITEM-LIST)
| 컬럼 | 타입 | 비고 |
|---|---|---|
| itemCode | Text | 코드 |
| name | Text | 명 |
| type | Text | 유형 |
| spec | Text | 규격 |
| unit | Text | 단위 |
| leadTime | Number | LT |
| useYn | Enum | 사용여부 |
| updatedAt | Datetime | 수정일시 |

버튼/동작
| 버튼 | 검증 | API | 성공 | 실패 | 로그 |
|---|---|---|---|---|---|
| 조회 | 필터 | GET /api/items | 리스트 갱신 | 안내 | ui.view.scr-0022 |
| 추가 | 권한 | 모달(0023) | 팝업 | 안내 | audit.ui.open_modal |
| 수정 | 선택/권한 | PUT /api/items/{id} | 갱신 | 403/409 안내 | audit.update |
| 삭제 | 선택/권한 | DELETE /api/items/{id} | 재조회 | 403/409 안내 | audit.delete |
| BOM 조회 | 선택 | GET /api/items/{id}/bom | BOM 표시 | 안내 | audit.view |

권한
| Viewer 이상 | 조회 |
| Manager 이상 | 추가/수정/삭제 |

API: GET /api/items (400/401/403/500), PUT /api/items/{id} (400/401/403/409/500), DELETE /api/items/{id} (401/403/409/500), GET /api/items/{id}/bom (401/403/500)

테스트: 코드 중복 409, 사용여부 토글, BOM 로딩, 권한 403, 500 복구

---
## SCR-0023 품목내역 추가 RevA 반영
| 화면 ID | SCR-0023 |
| 라우트 | /master/items (modal:add) |
| 목적 | 품목 등록 |

입력(I-ITEM)
| 필드 | 타입 | 필수 | 검증 |
|---|---|---|---|
| itemCode | Text | Y | 중복 불가 |
| name | Text | Y | 1~100 |
| type | Select | Y | 존재 |
| unit | Text | Y | 존재 |
| spec | Text | N | 0~200 |
| leadTime | Number | N | >=0 |
| lotSize | Number | N | >=0 |
| useYn | Select | N | ENUM |
| memo | Text | N | 0~500 |

버튼/동작: 저장(POST /api/items), 취소. 권한 Manager 이상. 테스트: 코드 중복 409, 필수 검증, 권한 403, 500 복구.

---
## SCR-0024 품목내역·공정 RevA 반영
| 화면 ID | SCR-0024 |
| 라우트 | /master/items/process |
| 목적 | 품목별 공정 라우팅 정의 |

뷰: 공정 시퀀스 테이블 {seq, process, stdTime, stdLoss, equipType, workerCnt}

버튼/동작: 추가/수정/삭제, 순서 변경. API: GET /api/items/{id}/routing, POST/PUT /api/items/{id}/routing (400/401/403/409/500). 권한 Manager 이상. 테스트: 순서 중복/누락, 표준시간 합계, 403/409, 500 복구.

---
## SCR-0025 품목유형 RevA 반영
| 화면 ID | SCR-0025 |
| 라우트 | /master/item-types |
| 목적 | 품목유형 관리 |

필터: typeCode/name/useYn. 그리드: typeCode, name, description, useYn, updatedAt.

버튼/동작: 조회(GET /api/item-types), 추가(0026), 수정(PUT /api/item-types/{id}), 삭제/사용여부(PUT/DELETE), 엑셀다운. 권한: Viewer 조회, Manager 이상 CRUD. 오류: 400/401/403/409/500. 테스트: 코드 중복, 사용중 삭제 제한, 권한/오류 복구.

---
## SCR-0026 품목유형 추가 RevA 반영
입력: typeCode(Y, 중복 불가), name(Y), description(N), useYn(N). 저장 POST /api/item-types. 권한 Manager 이상. 테스트: 중복 409, 필수 검증, 403/500.

---
## SCR-0027 작업공정 RevA 반영
| 화면 ID | SCR-0027 |
| 라우트 | /master/processes |
| 목적 | 공정 코드/속성 관리 |

필터: processCode/name/category/useYn. 그리드: processCode, name, category, stdTime, equipType, useYn, updatedAt.

버튼/동작: 조회(GET /api/processes), 추가(0028), 수정(PUT /api/processes/{id}), 삭제(DELETE), 사용여부 토글. 권한: Viewer 조회, Manager 이상 CRUD. 오류코드: 400/401/403/409/500. 테스트: 참조 중 삭제 제한, stdTime 숫자 검증, 권한/500.

---
## SCR-0028 작업공정 추가 RevA 반영
입력: processCode(Y, 중복 불가), name(Y), category(Y), stdTime(Y, >0), stdLoss(N, 0~100), equipType(N), workerSkill(N), useYn(N). 저장 POST /api/processes. 권한 Manager 이상. 테스트: 중복 409, 범위 검증, 403/500.

---
## SCR-0029 재고현황 RevA 반영
| 항목 | 내용 |
|---|---|
| 화면 ID | SCR-0029 |
| 라우트 | /inventory/status |
| 목적 | 재고 현황 조회(가용/불량 포함) |

필터: factory/warehouse, item, lot, status(가용/불량), 기준일.

그리드(G-STOCK-STATUS): item, lot, qty, location, status, inboundDate, expiry, updatedAt. PII(창고 주소 등) 마스킹/AES 명시.

API: GET /api/inventory/status (400/401/403/500). 권한: Viewer 이상 조회. 테스트: 필터 조합, 합계/가용 수량, 권한, 500.

---
## SCR-0030 입고내역 RevA 반영
| 화면 ID | SCR-0030 |
| 라우트 | /inventory/inbound |
| 목적 | 입고내역 조회/상태 |

필터: from/to, warehouse, item, supplier/partner, type(수주/구매/반품), status.

그리드(G-INBOUND): inboundNo, refType/refNo, item, qty, warehouse, lot, status, recvDate, updatedAt.

버튼/동작: 조회(GET /api/inbound), 추가(0031), 상태변경(PATCH /api/inbound/{id}/status), 삭제, 엑셀다운. 권한: Viewer 조회, Manager 이상 입력/상태/삭제. 오류: 400/401/403/409/500. 테스트: 로트 생성 규칙, 확정 후 수정 제한, 권한/500.

---
## SCR-0031 입고내역 추가 RevA 반영
입력(I-STOCK-IN): refType/refNo, item, qty>0, warehouse, location, lot(optional), recvDate, inspector, memo. API POST /api/inbound. 권한 Manager 이상. 테스트: 창고/로케이션 필수, 수량>0, 권한/500.

---
## SCR-0032 출고내역 RevA 반영
필터: from/to, warehouse, item, outboundType(수주/이동/폐기), status. 그리드(G-OUTBOUND): outboundNo, refType/refNo, item, qty, warehouse, lot, status, shipDate, updatedAt. 버튼: 등록, 상태변경, 삭제, 엑셀. API: GET/POST/PATCH /api/outbound, 오류 400/401/403/409/500. 권한: Viewer 조회, Manager 이상. 테스트: 재고 잔량/FIFO, 권한/500.

---
## SCR-0033 소요산출 RevA 반영
입력: 기준공장, 계획범위(기간/지시선택), 산출옵션(대체/여유율), 실행 버튼. 결과 그리드: item, requiredQty, availableQty, shortageQty, substituteYn. API: POST /api/requirements/run (400/401/403/409/500). 권한: Manager 이상. 테스트: 부족 수량 계산, 대체 반영, 권한/500.

---
## SCR-0034 소요산출 결과 RevA 반영
뷰: 산출 이력 리스트 + 상세 결과. API: GET /api/requirements/results, GET /api/requirements/{id} (401/403/500). 권한: Viewer 이상 조회. 테스트: 이력 선택 시 상세 로딩, 재계산 버튼, 권한/500.

---
## SCR-0035 불량현황 RevA 반영
필터: 기간, 공장/라인, 품목, 불량유형. 차트+그리드(G-DEFECT-STATUS: line, item, defectCount, defectRate, topDefectType). API: GET /api/quality/defects/status (400/401/403/500). 권한: Viewer 이상. 테스트: 빈 데이터, 필터 재조회, 권한/500.

---
## SCR-0036 불량내역 RevA 반영
필터: 기간, 라인, 품목, 불량유형, 처리상태. 그리드(G-DEFECT): defectNo, date, line, item, type, qty, cause, action, status. 버튼: 추가/수정/삭제/상태변경. API: GET/POST/PUT/PATCH /api/defects (400/401/403/409/500). 권한: Manager 이상 CRUD, Viewer 조회. 테스트: qty>0, 상태 전환, 권한/500.

---
## SCR-0037 불량유형 RevA 반영
그리드: typeCode, name, category, severity, useYn, updatedAt. 버튼: 추가/수정/삭제. API: GET/POST/PUT /api/defect-types (400/401/403/409/500). 권한: Manager 이상. 테스트: 코드 중복, 사용중 삭제 제한, 권한/500.

---
## SCR-0038 설비현황 RevA 반영
필터: 공장/라인/설비유형. 뷰: 설비 상태보드, KPI, 알람 리스트. 그리드(G-EQUIP-STATUS): equipCode, name, status, lastEvent, runningTime, downtime, updatedAt. API: GET /api/equipment/status (400/401/403/500). 권한: Viewer 이상. 테스트: 새로고침, 알람 표시, 500 복구.

---
## SCR-0039 모니터링 현황 RevA 반영
뷰: 태그 리스트 {tag, desc, value, unit, updatedAt, status}, 선택 태그 그래프. 필터: 설비, 태그 그룹. API: GET /api/monitoring/tags (400/401/403/500) + 실시간(WebSocket/SSE). 권한: Viewer 이상. 테스트: 값 갱신, 임계치 알람, 연결 실패 복구.

---
## SCR-0040 설비등록 RevA 반영
필터: 설비코드/명, 공장/라인, 사용여부. 그리드(G-EQUIP): equipCode, name, type, line, maker, model, installDate, useYn, updatedAt. PII(위치/주소) 마스킹·AES. API: GET/POST/PUT/DELETE /api/equipment (400/401/403/409/500). 권한: Viewer 조회, Manager 이상 CRUD. 테스트: 코드 중복, 사용중 삭제 제한, 설치일 미래 차단, 권한/500.

---
## SCR-0041 설비등록 추가 RevA 반영
입력(I-EQUIP): equipCode(Y, 중복 불가), name(Y), type(Y), line(Y), spec(N), capacity(N), maker(N), installDate(N, 미래 금지), useYn(N), memo(N). 저장 POST /api/equipment. 권한 Manager 이상. 테스트: 중복 409, 미래일 차단, 권한/500.

---
## SCR-0042 사용자 RevA 반영
필터: userId/name/role/status. 그리드(G-USER): userId, name, role, dept, email, status, lastLogin, updatedAt. 버튼: 추가, 초기화, 잠금/해제, 비밀번호 초기화. API: GET/POST/PUT /api/admin/users, POST /api/admin/users/{id}/reset-password (400/401/403/409/500). 권한: SystemAdmin/TenantAdmin 관리, Viewer 조회. 로그: admin.action(비번 초기화), data.mutation. 테스트: 중복 ID, 상태 토글, 권한/500.

---
## SCR-0043 사용자권한 RevA 반영
뷰: 역할별 메뉴/권한 매트릭스(조회/생성/수정/삭제/승인). API: GET/PUT /api/admin/permissions, POST role (400/401/403/409/500). 권한: SystemAdmin/TenantAdmin. 테스트: 최소 1개 관리자 롤 유지, 저장 후 즉시 반영, 권한/500.

---
## SCR-0044 업무 담당자 설정 RevA 반영
입력: targetType(order/item/process), targetId, 담당자, validFrom/To. API: POST /api/admin/responsibles/assign (400/401/403/409/500). 권한: TenantAdmin 이상. 테스트: 중복 매핑 방지, 기간 검증, 권한/500.

---
## SCR-0045 업무 담당자 RevA 반영
그리드: targetType/Id/name, 담당자, validFrom/To, active. 필터: 유형/담당자/유효여부. API: GET /api/admin/responsibles, DELETE /{id} (400/401/403/409/500). 권한: TenantAdmin 이상 관리, Viewer 조회. 테스트: 만료 표시, 삭제/비활성, 권한/500.

---
## SCR-0046 거래처 RevA 반영
필터: 거래처코드/명, 구분(매출/매입/양쪽), 지역, 상태. 그리드(G-PARTNER): partnerCode, name, type, contact, email, status, creditLimit, updatedAt. PII(주소/연락처) 마스킹·AES. 버튼: 추가(0047), 수정, 삭제, 상태변경, 엑셀. API: GET/POST/PUT/DELETE /api/partners (400/401/403/409/500). 권한: Viewer 조회, Manager 이상 CRUD. 테스트: 코드 중복, 참조 검사, 권한/500.

---
## SCR-0047 거래처 추가 RevA 반영
입력: partnerCode(Y, 중복 불가), name(Y), type(Y), bizNo(Y 형식 검증), contact/email/address/creditLimit/status. API: POST /api/partners. 권한 Manager 이상. 테스트: bizNo/email 검증, 중복 409, 권한/500.

---
## SCR-0048 생산공장/창고 RevA 반영
필터: code/name, type(factory/warehouse), region, status. 그리드(G-FACTORY): code, name, type, region, address(PII 마스킹·AES), manager, useYn, updatedAt. 버튼: 추가(0049), 수정, 삭제. API: GET/POST/PUT/DELETE /api/facilities (400/401/403/409/500). 권한: Viewer 조회, TenantAdmin 이상 관리. 테스트: 코드 중복, 사용중 창고 삭제 제한, 권한/500.

---
## SCR-0049 생산공장/창고 추가 RevA 반영
입력: code(Y, 중복 불가), name(Y), type(Y), region(N), address(N, PII 암호화/마스킹), manager/contact(N), useYn(N). API: POST /api/facilities. 권한 TenantAdmin 이상. 테스트: 코드 형식/중복, 권한/500.

---
## 라벨/도식·API 정합성 최종 점검 체크리스트
- UI 라벨/순서: 사용설명서 Figure와 실제 라우트/필드/버튼 라벨 1:1 확인(각 화면별 입력/그리드/버튼 표를 Figure 순서와 맞춤).
- API 계약: 백엔드 실제 스펙과 비교해 경로·파라미터·응답 필드·오류코드 확정(모든 CRUD/Export/Status 변경 포함).
- 권한/역할: SystemAdmin/TenantAdmin/Manager/Operator/Viewer별 접근/동작 제어가 구현과 일치하는지 최종 검증.
- PII/보안: 주소·연락처·계정정보 등 PII 컬럼의 마스킹·AES 표기 반영 여부 확인, 로그 보관 기간(180/365/730일) 정책 일치 확인.
- 테스트 케이스: TC-SCR-XXXX-0n 번호로 정규화했는지, 도메인 특화 TC(잠금/상태전환/용량/FIFO/중복/정책 위반) 포함 여부 확인.

## 자료 부재 시 적용한 기본 가정 (추후 확정 필요)
- UI 라벨/순서: 사용설명서 문맥 기반 추정 배치. 실제 Figure/펜팟 라벨로 교체 필요.
- API 필드/오류코드: 07_api_spec_baseline + RevA 표준(400/401/403/409/423/500)으로 채움. 백엔드 확정 스펙으로 교체 필요.
- PII/보안: 주소·연락처 등은 기본적으로 마스킹·AES-256-GCM 표기, 로그 보관 180/365/730일 기준을 사용. 실제 보안 정책에 맞춰 조정 필요.
- 권한: SystemAdmin/TenantAdmin/Manager/Operator/Viewer 모델로 통일. 조직별 역할 정의와 맞는지 최종 검증 필요.
- 테스트: TC-SCR-XXXX-0n 패턴으로 기본 세트와 도메인 특화 TC를 기입. 실제 업무 규칙·API 응답 기준으로 기대 결과를 세분화해야 함.
