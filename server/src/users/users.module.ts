import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { User } from '../entities/user.entity';
import { LoginHistory } from '../entities/login-history.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, LoginHistory])],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
