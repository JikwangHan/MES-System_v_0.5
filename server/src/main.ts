import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

// 이 파일은 NestJS 애플리케이션의 시작점(엔트리 포인트)입니다.
// 프로그램이 실행되면 bootstrap 함수가 호출되어 서버를 구동합니다.
async function bootstrap() {
  // AppModule에 정의된 설정과 의존성을 기반으로 Nest 애플리케이션 인스턴스를 생성합니다.
  const app = await NestFactory.create(AppModule);

  // CORS 설정: 프론트 개발 서버(5173)와 연동할 수 있도록 허용합니다.
  app.enableCors({
    origin: ['http://localhost:5173'],
    credentials: true,
  });

  // 환경 변수 PORT가 지정되어 있으면 해당 포트로, 없으면 기본값 3000번 포트로 서버를 실행합니다.
  const port = process.env.PORT ?? 3000;

  // 지정된 포트에서 HTTP 서버를 시작합니다.
  await app.listen(port);

  // 서버가 정상적으로 시작되었음을 콘솔에 안내합니다.
  // 추후 다른 장비나 시뮬레이터와 연동할 때, 서버 포트를 쉽게 확인할 수 있도록 합니다.
  console.log(`MES-System 서버가 http://localhost:${port} 에서 실행 중입니다.`);
}

// 위에서 정의한 bootstrap 함수를 호출하여 실제로 서버를 시작합니다.
bootstrap();
