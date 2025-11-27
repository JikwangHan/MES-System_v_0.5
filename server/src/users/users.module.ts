import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

// UsersModule은 사용자 관련 엔티티/서비스/컨트롤러를 묶어서 관리합니다.
// TypeOrmModule.forFeature로 User 엔티티를 주입받을 수 있게 설정합니다.
@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
