# 05_설비_모니터링_ERD_초안

## 목표
- 설비(Equipment)와 설비 이벤트/센서 데이터(EquipmentEvent, SensorData)를 회사(업체) 단위로 안전하게 분리.
- 실시간/주기적 수집 데이터를 저장하고, 이벤트/알람 이력을 추적.

## 주요 테이블

### 1) equipment (설비 마스터)
- id (PK)
- company_id (FK → companies.id)
- code (설비 코드, 업체 내 유니크)
- name (설비 명)
- type (설비 유형, 예: PACKAGING, ROBOT, CNC)
- location (설치 위치/라인 정보)
- status (현재 상태, 예: RUNNING, IDLE, DOWN, MAINT)
- description (비고)
- created_at / updated_at

### 2) equipment_event (알람/이벤트 로그)
- id (PK)
- company_id (FK → companies.id)
- equipment_id (FK → equipment.id)
- level (INFO/WARN/ERROR/CRITICAL)
- code (이벤트 코드, 설비 프로토콜 코드 등)
- message (이벤트 메시지)
- occurred_at (발생 시각)
- resolved_at (해제 시각, optional)
- created_at / updated_at

### 3) sensor_data (센서 시계열)
- id (PK)
- company_id (FK → companies.id)
- equipment_id (FK → equipment.id)
- metric (항목명, 예: temperature, pressure, speed)
- value (숫자 값)
- unit (단위, 예: C, bar, rpm)
- recorded_at (수집 시각)
- created_at / updated_at

## 인덱스/제약
- equipment: UNIQUE (company_id, code)
- equipment_event: INDEX (company_id, equipment_id, occurred_at)
- sensor_data: INDEX (company_id, equipment_id, metric, recorded_at)

## 접근 제어(권한)
- SYSTEM_ADMIN: 전체 업체 조회/추가/수정 가능
- 업체 관리자(COMPANY_ADMIN): 자사 설비 등록/수정, 이벤트/센서 조회
- 일반 사용자(USER): 자사 설비/이벤트/센서 조회 (읽기 전용)

## API 초안
- GET /equipment (list) — 회사 필터는 토큰 companyId 또는 companyCode 쿼리
- POST /equipment — SYSTEM_ADMIN/COMPANY_ADMIN만
- GET /equipment/:id/events — 이벤트 조회 (기간/레벨 필터 옵션)
- GET /equipment/:id/sensors — 센서 데이터 조회 (기간/metric 필터 옵션)

## 프론트 뼈대
- /app/equipment: 설비 목록 + 상태 표시
- /app/equipment/events: 설비 이벤트 테이블(필터: 기간, 레벨)
- /app/equipment/sensors: 센서 데이터(필터: 기간, metric)

## 기타
- 장기적으로 sensor_data는 파티션/집계 테이블(sensor_data_agg) 고려.
- 로그/이력 테이블은 company_id를 반드시 포함해 멀티테넌트 분리 유지.
