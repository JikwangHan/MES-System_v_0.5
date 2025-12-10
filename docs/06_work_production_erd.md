# 06_작업_생산_ERD_초안

## 목표
- 작업지시(WorkOrder)와 공정/실적(WorkOperation, ProductionResult)을 업체 단위로 관리.
- 설비/모니터링(Equipment) 모듈과 연계해 어느 설비에서 어떤 공정이 수행되는지 기록.

## 주요 테이블

### 1) work_order (작업지시)
- id (PK)
- company_id (FK → companies.id)
- code (지시코드, 업체 내 유니크)
- item_code (품목 코드)
- item_name (품목 명)
- qty (지시 수량)
- due_date (납기일)
- status (PLANNED / IN_PROGRESS / DONE / HOLD / CANCEL)
- description (비고)
- created_at / updated_at

### 2) work_operation (공정/공정 순번)
- id (PK)
- company_id (FK → companies.id)
- work_order_id (FK → work_order.id)
- seq (공정 순번)
- equipment_id (FK → equipment.id, nullable)
- plan_start_at / plan_end_at
- actual_start_at / actual_end_at
- status (PLANNED / RUNNING / DONE / HOLD)
- created_at / updated_at

### 3) production_result (생산 실적)
- id (PK)
- company_id (FK → companies.id)
- work_order_id (FK → work_order.id)
- work_operation_id (FK → work_operation.id, nullable)
- good_qty (양품 수량)
- defect_qty (불량 수량)
- recorded_at (입력 시각)
- created_at / updated_at

## 인덱스/제약
- work_order: UNIQUE(company_id, code), INDEX(due_date, status)
- work_operation: INDEX(company_id, work_order_id, seq)
- production_result: INDEX(company_id, work_order_id, work_operation_id, recorded_at)

## 권한
- SYSTEM_ADMIN / COMPANY_ADMIN: 생성/수정/조회
- USER: 조회

## API 초안
- GET /work/orders?status&dueFrom&dueTo&item → 지시 목록
- POST /work/orders → 지시 생성 (관리자/운영자)
- GET /work/orders/:id/operations → 공정 목록
- GET /work/orders/:id/results → 실적 목록

## 프론트 뼈대
- /app/work/orders: 지시 목록 + 필터(지시코드/품목/상태/납기)
- 하단 확장: 선택한 지시의 공정/실적 탭 조회(차후)

