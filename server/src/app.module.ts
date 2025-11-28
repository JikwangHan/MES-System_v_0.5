import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { User } from './entities/user.entity';
import { LoginHistory } from './entities/login-history.entity';

@Module({
  // imports 배열에 앱에서 사용할 전역 모듈을 등록합니다.
  // ConfigModule: .env 값을 Nest 컨테이너에서 읽어 쓸 수 있게 해줍니다.
  // TypeOrmModule: MariaDB와의 연결을 설정합니다.
  // UsersModule: 사용자 엔티티/서비스/컨트롤러를 등록합니다.
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // 어디서나 환경변수를 주입받을 수 있도록 전역 설정
      envFilePath: '.env.development', // 개발용 기본 경로 (운영 시 .env.production 등으로 교체)
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT ?? 3306),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      // autoLoadEntities: true를 켜면, 각 모듈에서 등록한 엔티티를 자동으로 스캔합니다.
      autoLoadEntities: false,
      entities: [User, LoginHistory],
      // 개발 단계에서는 synchronize를 true로 두어 엔티티 변경 시 테이블을 자동 생성/수정하게 합니다.
      // 운영 환경에서는 false로 전환하고, 마이그레이션을 사용해야 합니다.
      synchronize: true,
      // DB 연결이 실패할 때 일정 횟수 재시도해주어 초기 부팅 시 안정성을 높입니다.
      retryAttempts: 5,
      retryDelay: 2000,
    }),
    UsersModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
