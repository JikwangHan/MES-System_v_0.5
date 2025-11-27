import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

// UsersService는 사용자 관련 비즈니스 로직을 담당합니다.
// 현재는 단순 조회/생성을 제공하며, 추후 권한/조직 연계 로직으로 확장할 수 있습니다.
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  // 모든 사용자 목록을 조회합니다.
  async findAll(): Promise<User[]> {
    return this.usersRepository.find({ order: { id: 'ASC' } });
  }

  // 새 사용자를 생성합니다. 이름이 없으면 기본값을 사용합니다.
  async create(name?: string): Promise<User> {
    const user = this.usersRepository.create({
      name: name?.trim() || '테스트 사용자',
    });
    return this.usersRepository.save(user);
  }
}
