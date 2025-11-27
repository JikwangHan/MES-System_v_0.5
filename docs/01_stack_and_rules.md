# 01_기술스택_및_개발규칙_정리 (v0.1)

## 1. 개요
- MES-System v0.5 개발을 위한 공식 기술 스택과 개발 규칙 정리.
- 백엔드/프론트/DB 스택, 브랜치 전략, 커밋 규칙, 코드 스타일, 환경설정 규칙, 버전 정책을 포함.

## 2. 기술 스택
### 2.1 백엔드 (NestJS)
- 언어/런타임: TypeScript, Node.js 20.x LTS
- 프레임워크: NestJS (의존성 주입, 모듈 구조)
- ORM/DB: TypeORM + MariaDB
- 인증/보안: @nestjs/passport, passport-jwt (JWT), bcrypt, helmet
- 설정 관리: dotenv (.env.*)
- 로깅: winston 또는 Nest 내장 로거(운영 시 winston+파일 롤링 권장)
- 테스트: Jest (단위/통합)

### 2.2 프론트엔드 (React)
- 언어: TypeScript
- 프레임워크/빌드: React + Vite
- UI 컴포넌트: MUI 또는 Ant Design (팀 취향/일관성에 따라 선택)
- Grid: AG Grid Community Edition
- Chart: Recharts 또는 react-chartjs-2 + Chart.js
- Calendar: FullCalendar (React 래퍼)
- 상태관리/데이터패칭: React Query(+Context/Zustand), React Router

### 2.3 공통/기타
- 패키지 버전 관리: package-lock.json으로 고정
- 문자셋: UTF-8, DB는 utf8mb4 권장

## 3. 리포지토리 구조
```
MES-System_v_0.5/
  server/   # NestJS 백엔드
  client/   # React + Vite 프론트엔드
  docs/     # 설계 문서, 규칙 정리, ERD, 회의 기록 등
  README.md # 전체 프로젝트 개요
```

## 4. 브랜치 전략
- main: 안정/배포 브랜치 (검증된 코드만)
- dev: 통합 개발 브랜치 (기능 병합·통합 테스트)
- feature/*: 기능 단위 브랜치 (예: feature/auth-login)
- 운용 예시: dev에서 파생 → 기능 개발 → PR/병합 → dev 안정화 후 main 병합

## 5. 커밋 메시지 규칙
- 접두사 태그 사용: feat | fix | chore | refactor | docs
- 예: `feat: 사용자 로그인 API 구현`, `chore: ESLint 및 Prettier 설정 추가`

## 6. 코드 스타일 원칙 (ESLint/Prettier 예정)
- 들여쓰기: 2 스페이스
- 문자열: 작은따옴표 통일
- 세미콜론: 사용
- 파일/폴더: React 컴포넌트 PascalCase (예: OrderListPage.tsx), 서비스/모듈 camelCase (order.service.ts)
- 주석: 한글, 의도/이유를 간단히 명시 (복잡 로직 앞 설명)

## 7. 환경 설정 및 비밀정보 관리
- .env.* 파일에 비밀정보(DB 계정, JWT 시크릿 등) 관리, Git에 올리지 않음
- 예시 (개발):
  - NODE_ENV=development
  - DB_HOST=localhost
  - DB_PORT=3306
  - DB_USER=mes_user
  - DB_PASSWORD=비밀번호
  - DB_NAME=mes_system_dev
  - JWT_SECRET=랜덤시크릿
- 환경 분리: .env.dev(또는 .env.development), .env.prod(또는 .env.production)

## 8. 버전 정책
- Node.js: LTS만 사용 (예: 20.x)
- 주요 라이브러리: 안정(stable) 버전 채택
- package-lock.json을 함께 관리하여 설치 버전 일관성 유지

## 9. 권장 추가 설정 (향후 작업)
- 로깅: winston + 일자별 파일 롤링 (운영)
- 전역 예외 필터: 에러 응답 포맷 통일 `{ success: false, error: { code, message } }`
- 공통 응답 포맷: 성공 `{ success: true, data, meta }`
- 권한 데코레이터/가드 표준화: @Roles, @Permissions
- 마이그레이션/시드: TypeORM migration, 초기 코드값 시드 스크립트
- 테스트 템플릿: 서비스/리포 단위 Jest 샘플 테스트 작성

## 10. 체크리스트 (1단계 완료 확인)
- [ ] 문서 작성/버전(v0.1) 완료
- [ ] 스택(백엔드/프론트/DB) 명시
- [ ] 브랜치 전략/커밋 규칙 명시
- [ ] .env 규칙/비밀정보 관리 명시
- [ ] 폴더 구조(server/client/docs) 존재
- [ ] git status 확인, 새 문서 추가 시 커밋 준비
- [ ] (선택) dev 브랜치 생성·원격 추적 완료
