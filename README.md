MES System v0.5 개요 및 기본 사용법
==================================

프로젝트 소개
-------------
- 스마트 팩토리용 MES 웹 시스템 v0.5입니다.
- 단일 리포지토리 안에 백엔드(`server` - NestJS)와 프론트엔드(`client` - React+Vite`)를 함께 관리합니다.
- DB는 MariaDB를 사용하며, 환경 설정은 `.env.*` 파일로 분리합니다.

기본 구조
---------
- `server/` : NestJS 백엔드
- `client/` : React + Vite 프론트엔드
- `docs/` : 설계·규칙·회의록 등 문서
- `README.md` : 전체 프로젝트 개요

개발 환경 요구사항
-----------------
- Node.js: 20.x LTS 권장 (현재 설치된 버전이 22.x라면 20.x LTS로 맞추는 것을 추천)
- npm: Node와 함께 설치된 버전 사용
- DB: MariaDB (로컬/테스트용 인스턴스 준비)

E2E 테스트 실행 방법 (Cypress)
-------------------------------
사전 준비
- 프론트엔드 의존성 설치: `cd client && npm install`
- 서버가 3000 포트에서 기동 중이어야 함: `cd server && npm run start:dev`
- 기본 테스트는 다음 ENV를 지정하면 바로 실행됩니다. (PowerShell 예시)
  ```powershell
  $env:CYPRESS_USER_ID="oper2"               # 일반 사용자 계정
  $env:CYPRESS_USER_PW="oper2222"
  $env:CYPRESS_COMPANY_ADMIN_ID="oper1"     # 업체 관리자 계정(있다면)
  $env:CYPRESS_COMPANY_ADMIN_PW="oper1111"
  $env:CYPRESS_ADMIN_ID="admin"             # 시스템 관리자
  $env:CYPRESS_ADMIN_PW="admin123"
  ```

실행
- 전체 스펙(스모크 + 권한 + 기간 + 검색 + 테넌트 필터 + CRUD 모달 등)
  ```powershell
  cd client
  npm run cy:run   # headless 전체 스펙 실행
  ```
- GUI로 개별 스펙 선택 실행
  ```powershell
  cd client
  npm run cy:open  # Cypress GUI → 스펙 목록에서 선택 실행
  ```

결과 확인
- 콘솔 출력으로 스펙별 통과/실패 여부 확인
- 스크린샷/영상: `client/cypress/screenshots`, `client/cypress/videos` (현재 영상 저장은 false로 설정)

자주 발생할 수 있는 경고
- `chcp` 관련 경고는 로캘 명령어 미인식으로 테스트 결과에 영향 없음
- 이전 프로필 삭제 실패 경고도 실행/종료에 영향 없음

설치 및 실행(로컬)
------------------
1) 리포지토리 클론 후 루트에서 진행  
2) 프론트엔드 준비  
   ```bash
   cd client
   npm install
   npm run dev
   ```  
3) 백엔드 준비  
   ```bash
   cd server
   npm install   # Nest CLI가 초기 설치를 수행했지만, 필요 시 재실행
   npm run start:dev
   ```  
4) 환경 변수 파일 예시(`server/.env.dev` 등)를 만들고 DB 연결 정보를 채워 넣습니다.

브랜치/커밋 규칙(요약)
---------------------
- 브랜치: `main`(안정/배포), `dev`(통합), `feature/*`(기능 단위)
- 커밋 메시지 접두사: `feat`, `fix`, `chore`, `refactor`, `docs`

문서 위치
---------
- `docs/01_stack_and_rules.md`: 기술 스택 및 개발 규칙(v0.1)
- `docs/00_requirements_prioritized_v0.5.md`: 최신 요구사항 우선순위 및 품질/보안 원칙
- `docs/99_regression_checklist.md`: 회귀 테스트 체크리스트 및 E2E 커버리지 요약

주의사항
--------
- `.env`와 비밀정보는 Git에 올리지 않습니다.
- `node_modules/`, `dist/`, `build/` 등은 `.gitignore`로 관리합니다.
