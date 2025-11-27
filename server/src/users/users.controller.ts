import { Body, Controller, Get, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from '../entities/user.entity';

// UsersController는 /users 경로로 들어오는 HTTP 요청을 처리합니다.
// - GET /users : 모든 사용자 목록 조회
// - POST /users : 새 사용자 생성 (name이 없으면 기본값 "테스트 사용자")
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // GET /users 요청 처리: DB에 저장된 모든 사용자 목록을 반환합니다.
  @Get()
  async getUsers(): Promise<User[]> {
    return this.usersService.findAll();
  }

  // POST /users 요청 처리: name 값을 받아 새 사용자를 생성합니다.
  // 요청 본문에 { "name": "원하는 이름" } 형태로 보내면 해당 이름으로 저장됩니다.
  // name이 비어 있으면 기본값 "테스트 사용자"로 저장됩니다.
  @Post()
  async createUser(@Body('name') name?: string): Promise<User> {
    return this.usersService.create(name);
  }
}
