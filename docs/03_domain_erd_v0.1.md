# 도메인 모듈 및 ERD 1차 초안 (v0.1)

본 문서는 MES-System_v_0.5의 백엔드 도메인 구조와 주요 엔티티/관계를 1차로 정리한 초안입니다. 추후 엔티티 세부 필드, 제약, 마이그레이션 설계 시 참고용으로 사용합니다.

## 0. 환경 메모
- 권장 Node 버전: 20.x LTS (현재: 22.21.0). 개발/빌드/배포 환경을 20 LTS로 통일하면 향후 exe 패키징 안정성이 높음.
- ORM: TypeORM (개발 단계 `synchronize: true`, 운영 전환 시 `synchronize: false` + migration)

## 1. 모듈 구상 (NestJS)
- master: 조직/공장/창고/거래처/코드/품목유형/품목/BOM/공정
- order: 수주헤더/수주라인/납품/반품
- inventory: 재고/입고/출고/이동/소요산출 결과
- production: 작업지시/공정작업/작업이력/작업분배
- quality: 불량유형/불량내역
- equipment: 설비/설비상태/설비이벤트
- monitoring: 센서 RAW/집계/모니터링 현황
- system: 사용자/권한/메뉴/역할/코드테이블

## 2. 엔티티 초안
### MasterData
- org (조직), factory (공장), warehouse (창고: factory FK)
- partner (거래처)
- code_group/code (공통 코드)
- item_category (품목범주/유형 트리)
- item (품목), bom (BOM: parent item -> child item, qty), process (공정/세부유형)

### Order
- order_header (수주헤더: partner FK, status, dates)
- order_line (수주라인: header FK, item FK, qty, price)
- delivery (납품: order_line FK, qty, date, warehouse FK)
- return (반품: order_line FK, qty, date, warehouse FK)

### Inventory
- inventory (재고 스냅샷 또는 뷰용: item FK, warehouse FK, qty)
- stock_in (입고: item, warehouse, type, qty, lot, status)
- stock_out (출고: item, warehouse, type, qty, lot, status)
- stock_move (이동: from_wh, to_wh, qty)
- requirements_result (소요산출 결과: order_line FK, item FK, required_qty, shortage_qty)

### Production
- work_order (작업지시: order_line FK, item FK, plan dates/qty, status)
- work_process (공정작업: work_order FK, process FK, status, start/end)
- work_history (작업 이력/분배: 작업자, 처리수량, 시간 기록)

### Quality
- defect_type (불량유형 트리)
- defect (불량내역: item/process/work_order FK, qty, date, customer)

### Equipment
- equipment (장비: 유형/통신설정)
- equipment_state (설비상태 스냅샷 또는 로그)
- equipment_event (재시작/알람 등 이벤트 로그)

### Monitoring
- sensor_raw (센서 RAW: 설비/채널, timestamp, value)
- sensor_agg (센서 집계: 기간별 sum/avg/max/min)
- monitoring_view (현황판용 뷰/테이블)

### System
- user (사용자)
- role (역할/권한그룹)
- permission/menu (메뉴/권한 매핑)
- user_role (N:M 매핑)

## 3. 관계 요약 (예시)
- factory 1:N warehouse
- item_category 1:N item_category (트리), item_category 1:N item
- item 1:N bom (parent -> child)
- order_header 1:N order_line; order_line 1:N delivery/return
- warehouse 1:N stock_in/out/move; item 1:N stock_in/out/move
- order_line 1:N work_order; work_order 1:N work_process; work_process 1:N work_history
- process 1:N work_process; defect_type 1:N defect; work_order/process/item -> defect (연계)
- equipment 1:N sensor_raw/event/state; sensor_raw -> sensor_agg (집계)
- user N:M role (user_role); role N:M permission/menu

## 4. 마이그레이션/운영 전환 메모
- 개발: `synchronize: true`로 빠르게 스키마 반영
- 운영: `synchronize: false`, TypeORM migration으로 관리 (DDL 변경 이력 추적)

## 5. 후속 작업 가이드
- 엔티티 정의 시 PK/FK/인덱스 우선 설계 (order_no, item_code, dates 등)
- lot, status, type 등 공통 코드값을 code_group/code로 관리
- RAW/집계 테이블은 파티셔닝/인덱스 전략 검토(모니터링/센서 대량 데이터 대비)
- 인증/권한: user/role/permission 구조에 맞춰 Auth 모듈 설계 (JWT)
