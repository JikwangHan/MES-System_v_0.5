import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

// 애플리케이션을 부팅하고 HTTP 서버를 여는 진입점입니다.
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 프런트 개발 서버(5173) 접근을 허용합니다.
  app.enableCors({
    origin: ['http://localhost:5173'],
    credentials: true,
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`MMS(Manufacturing Management System) 서버가 http://localhost:${port} 에서 실행 중입니다.`);
}

bootstrap();
