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

주의사항
--------
- `.env`와 비밀정보는 Git에 올리지 않습니다.
- `node_modules/`, `dist/`, `build/` 등은 `.gitignore`로 관리합니다.
