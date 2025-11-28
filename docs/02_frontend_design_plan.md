# 프론트엔드 디자인/구현 계획 (요약)

이 문서는 `MES_WebServer_Frontend_DesignSystem_v0_1.docx`, `MES_WebServer_UIUX_design_v0_2.docx`, `MES_WebServer_UIUX_DesignGuide_Penpot_v0_1.docx`의 핵심 내용을 정리하고, 실제 React(프론트) 구현 시 적용할 실행 계획을 요약한 것입니다.

## 1) 기술 스택 확정(무료·오픈소스)
- React + TypeScript + Vite
- UI: Ant Design(antd) 기반 Layout/Menu/Form/Table/Modal 사용
- Grid: 우선 antd Table로 구현(필요 시 AG Grid CE 검토)
- Chart: Recharts
- HTTP: Axios
- 서버 상태 관리: TanStack Query(React Query)

## 2) 디자인 시스템 적용 포인트
- 폰트: Noto Sans KR(또는 Pretendard) – CSS 변수/Theme에서 일원화
- 컬러: antd 기본 Primary(#1677FF) + 상태색(Success/Warning/Error), 배경/경계 회색 계열
- 레이아웃: antd Layout(Header/Sider/Content), 좌측 메뉴 트리 + 상단 사용자/알림 영역
- 공통 컴포넌트: SearchPanel, DataGrid, ModalDialog, Button 세트(B-CRUD, B-JOB-WORKFLOW 등), StatusBadge, KPI_Card, ChartPanel
- 해상도: 1920x1080 기준, 1366x768 대응 여백/스크롤 고려

## 3) 화면 ID·라우트 매핑(문서 v0.2 기반 일부 예시)
- 로그인/계정: SCR-0002 `/login`, SCR-0003 `/account/change-password`
- 대시보드/일정: SCR-0004 `/dashboard/production`, SCR-0005 `/calendar`
- 수주/납품/반품: SCR-0008 `/orders/summary`, SCR-0009 `/orders`, SCR-0012 `/deliveries`, SCR-0014 `/returns`
- 작업/작업지시: SCR-0016 `/work/status`, SCR-0017 `/work/orders`, SCR-0020 `/work/orders/issue`
- 품목/BOM/공정: SCR-0022 `/master/items`, SCR-0025 `/master/item-types`, SCR-0027 `/master/processes`
- 재고/입출고/소요산출: SCR-0029 `/inventory/status`, SCR-0030 `/inventory/inbound`, SCR-0032 `/inventory/outbound`, SCR-0033 `/inventory/requirements`
- 품질: SCR-0035 `/quality/defects/status`, SCR-0036 `/quality/defects`, SCR-0037 `/quality/defect-types`
- 설비/모니터링: SCR-0038 `/equipment/status`, SCR-0039 `/equipment/monitoring`, SCR-0040 `/equipment`
- 시스템관리: SCR-0042 `/admin/users`, SCR-0043 `/admin/permissions`, SCR-0046 `/admin/partners`, SCR-0048 `/admin/factories-warehouses`

## 4) 입력/그리드/버튼 템플릿 활용
- 입력 템플릿 예: I-LOGIN, I-ORDER, I-DELIVERY, I-RETURN, I-JOB, I-ITEM, I-BOM-PROC, I-STOCK-IN, I-EQUIP, I-USER
- 그리드 템플릿 예: G-ORDER-LIST, G-DELIVERY-LIST, G-JOB-LIST, G-ITEM-LIST, G-STOCK-STATUS, G-DEFECT-LIST, G-USER-LIST
- 버튼/동작 템플릿 예: B-CRUD, B-JOB-WORKFLOW, B-CALENDAR, B-EQUIP-CTRL, B-USER-ADMIN
- 구현 시 각 화면 컴포넌트에서 템플릿을 상수/타입으로 분리해 재사용(컬럼 정의, 폼 필드 정의, 버튼 그룹 정의).

## 5) 단계별 구현 순서(실행 계획)
1. 의존성 설치: `npm install antd @ant-design/icons recharts axios @tanstack/react-query`
2. 레이아웃 틀 잡기: antd Layout/Menu로 좌측 메뉴·상단 헤더 구성, 라우트 구조에 화면 ID 매핑
3. 공통 컴포넌트 제작: SearchPanel, DataGrid 래퍼(antd Table), ModalDialog, ButtonGroup(B-CRUD 등), StatusBadge, KPI_Card, ChartPanel
4. 우선 구현 화면: 로그인, 대시보드, 수주내역, 재고현황 (SCR-0002, 0004/0005, 0009, 0029)
5. 차트/캘린더: Recharts로 대시보드 그래프, FullCalendar 도입 시 캘린더 화면 연결
6. 확장 구현: 품목/BOM, 작업/작업지시, 품질, 설비/모니터링, 시스템관리 순서로 확대

## 6) 검증 체크리스트(프론트)
- 화면 레이아웃이 사용설명서 Figure와 동일한지
- 화면 ID/라우트/메뉴 명칭 일관성
- 폰트/컬러/여백/정렬 일관성
- 공통 컴포넌트 재사용으로 중복 디자인 제거
- 반응성: 텍스트/버튼이 잘리지 않으며 최소 해상도(1366x768) 대응

## 7) 적용 시 유의사항
- 모든 주석/설명 한글, 초보자도 이해 가능하게 상세히 작성
- 빌드/배포 시 프론트 의존성이 exe 패키지에 포함되도록(추후 빌드 스크립트/Installer 단계에서 반영)
- MES_Simulator, Smart-Factory_Monitoring 연동을 고려해 설비·작업·품질 관련 화면 구조/데이터 모델을 사전에 맞춰 설계
