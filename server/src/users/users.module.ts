import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { User } from '../entities/user.entity';
import { LoginHistory } from '../entities/login-history.entity';
import { Company } from '../entities/company.entity';
import { UsersController } from './users.controller';
import { AdminUsersController } from './admin.controller';
import { APP_GUARD } from '@nestjs/core';
import { CompanyHeaderGuard } from '../common/company-header.guard';

@Module({
  imports: [TypeOrmModule.forFeature([User, LoginHistory, Company])],
  providers: [
    UsersService,
    // SYSTEM_ADMIN만 X-Company-Code 헤더를 사용할 수 있도록 제한
    { provide: APP_GUARD, useClass: CompanyHeaderGuard },
  ],
  controllers: [UsersController, AdminUsersController],
  exports: [UsersService],
})
export class UsersModule {}
