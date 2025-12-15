# 기본 API 스펙(가변형 템플릿)
> 실제 설비/공정 스펙 확정 전까지 사용되는 기본형입니다.  
> 추후 필드/엔드포인트가 바뀌어도 추가·삭제가 용이하도록 최소 필수 필드와 동작만 정의했습니다.

## 공통 원칙
- `companyCode` 쿼리 파라미터를 항상 받습니다. (`ALL`이면 전체 조회)
- 목록 API 응답 형태는 `{ items: [...], total: number }`로 통일합니다.
- 페이지네이션: `page`(1부터), `pageSize`(기본 10 또는 화면 설정) 사용.
- 날짜 필터: `from`, `to` (YYYY-MM-DD) 사용. 납기/기간 필드는 도메인에 맞게 `dueFrom`, `dueTo` 등으로 확장 가능합니다.
- 응답 필드에 `company { code, name }`를 포함하여 멀티테넌트 식별을 명확히 합니다.
- 실제 필드가 확정되면 이 문서에서 필드를 추가/삭제하고, 서버 DTO와 프론트 타입을 함께 업데이트합니다.

## 1) 작업지시 (Work Orders)
- GET `/work/orders`
  - query: `companyCode, code, itemName, status, dueFrom, dueTo, page, pageSize`
  - response: `{ items: [{ id, code, itemCode, itemName, qty, dueDate, status(PLANNED/IN_PROGRESS/DONE/HOLD/CANCEL), company{code,name}, createdAt, updatedAt }], total }`
- 이후 POST/PUT/PATCH/DELETE는 권한 정책 확정 후 추가.

## 2) 설비 (Equipment)
- GET `/equipment`
  - query: `companyCode, code, name, status, page, pageSize`
  - response: `{ items: [{ id, code, name, type, location, status(RUNNING/IDLE/DOWN/MAINT), company{code,name}, createdAt, updatedAt }], total }`

## 3) 수주 (Orders)
- GET `/orders`
  - query: `companyCode, orderNo, itemName, status, dueFrom, dueTo, page, pageSize`
  - response: `{ items: [{ id, orderNo, itemCode, itemName, qty, dueDate, status, company{code,name}, createdAt, updatedAt }], total }`

## 4) 재고 (Inventory)
- GET `/inventory`
  - query: `companyCode, itemCode, itemName, warehouse, page, pageSize`
  - response: `{ items: [{ id, itemCode, itemName, warehouse, stockQty, safetyQty, company{code,name}, createdAt, updatedAt }], total }`

## 5) 대시보드 (Dashboard)
- GET `/dashboard/summary`
  - query: `companyCode`
  - response 예시:
    ```json
    {
      "kpi": { "productionToday": 0, "defectRate": 0, "machineUtilization": 0 },
      "chartData": [{ "time": "10:00", "good": 0, "defect": 0 }],
      "recentOrders": [{ "orderNo": "", "itemName": "", "qty": 0, "company": { "code": "", "name": "" } }],
      "recentWorkOrders": [{ "code": "", "itemName": "", "qty": 0, "company": { "code": "", "name": "" } }]
    }
    ```

## 변경 시 안내
- 필드 추가/삭제, 상태값 변경, 필터 추가 시 이 문서부터 수정하고, 서버 DTO/엔티티와 프론트 타입을 함께 반영합니다.
- ALL 조회/특정 업체 조회 동작이 유지되도록 `companyCode` 파라미터 처리를 변경 시에도 명확히 남깁니다.
