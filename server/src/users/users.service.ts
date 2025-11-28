import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginHistory } from '../entities/login-history.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
    @InjectRepository(LoginHistory)
    private readonly historyRepo: Repository<LoginHistory>,
  ) {}

  async findByUsername(username: string): Promise<User | null> {
    return this.usersRepo.findOne({ where: { username } });
  }

  async findById(id: number): Promise<User | null> {
    return this.usersRepo.findOne({ where: { id } });
  }

  async create(dto: CreateUserDto): Promise<User> {
    const user = this.usersRepo.create(dto);
    return this.usersRepo.save(user);
  }

  async bumpFailedLogin(user: User, limit = 5): Promise<void> {
    user.failedLoginCount += 1;
    if (user.failedLoginCount >= limit) {
      user.isLocked = true;
    }
    await this.usersRepo.save(user);
  }

  async resetFailedLoginAndUpdateLoginAt(user: User): Promise<void> {
    user.failedLoginCount = 0;
    user.isLocked = false;
    user.lastLoginAt = new Date();
    await this.usersRepo.save(user);
  }

  async updatePassword(user: User, newHash: string): Promise<void> {
    user.passwordHash = newHash;
    user.lastPasswordChangedAt = new Date();
    user.mustChangePassword = false;
    await this.usersRepo.save(user);
  }

  async updateProfile(userId: number, payload: Partial<User>): Promise<User> {
    // username, role, isActive, isLocked 등 민감 필드는 여기서 변경하지 않습니다.
    const safePayload: Partial<User> = {
      displayName: payload.displayName,
      phone: payload.phone,
      companyName: payload.companyName,
    };
    await this.usersRepo.update(userId, safePayload);
    const updated = await this.findById(userId);
    return updated!;
  }

  async ensureDefaultAdmin(): Promise<void> {
    const admin = await this.findByUsername('admin');
    if (admin) return;
    const bcrypt = await import('bcrypt');
    const hash = await bcrypt.hash('admin123', 10);
    const user = this.usersRepo.create({
      username: 'admin',
      displayName: '관리자',
      passwordHash: hash,
      role: 'ADMIN',
      isActive: true,
      isLocked: false,
      failedLoginCount: 0,
      mustChangePassword: true,
    });
    await this.usersRepo.save(user);
  }

  async getLoginHistory(userId: number, limit = 10): Promise<LoginHistory[]> {
    return this.historyRepo.find({
      where: { user: { id: userId } },
      order: { loginAt: 'DESC' },
      take: limit,
    });
  }
}
