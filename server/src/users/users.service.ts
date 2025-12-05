import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginHistory } from '../entities/login-history.entity';
import { Company } from '../entities/company.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
    @InjectRepository(LoginHistory)
    private readonly historyRepo: Repository<LoginHistory>,
    @InjectRepository(Company)
    private readonly companyRepo: Repository<Company>,
  ) {}

  async findByUsername(username: string): Promise<User | null> {
    return this.usersRepo.findOne({ where: { username }, relations: ['company'] });
  }

  async findByUsernameAndCompany(username: string, companyCode: string): Promise<User | null> {
    const company = await this.companyRepo.findOne({ where: { code: companyCode } });
    if (!company) return null;
    return this.usersRepo.findOne({
      where: { username, company: { id: company.id } },
      relations: ['company'],
    });
  }

  async findById(id: number): Promise<User | null> {
    return this.usersRepo.findOne({ where: { id }, relations: ['company'] });
  }

  async findAll(companyCode?: string): Promise<User[]> {
    if (companyCode) {
      const company = await this.companyRepo.findOne({ where: { code: companyCode } });
      if (!company) return [];
      return this.usersRepo.find({ where: { company: { id: company.id } }, relations: ['company'] });
    }
    return this.usersRepo.find({ relations: ['company'] });
  }

  async create(dto: CreateUserDto): Promise<User> {
    const user = this.usersRepo.create(dto);
    return this.usersRepo.save(user);
  }

  async save(user: User): Promise<User> {
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
    // username, role, isActive, isLocked 는 보호 필드로 여기서 변경하지 않습니다.
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
    // 기본 회사(SYSTEM) 생성
    let systemCompany = await this.companyRepo.findOne({ where: { code: 'SYSTEM' } });
    if (!systemCompany) {
      systemCompany = this.companyRepo.create({ code: 'SYSTEM', name: '시스템' });
      systemCompany = await this.companyRepo.save(systemCompany);
    }

    const bcrypt = await import('bcrypt');
    const hash = await bcrypt.hash('admin123', 10);

    // username 기준으로 먼저 찾고, 회사가 다르면 SYSTEM으로 재연결
    const admin = await this.usersRepo.findOne({
      where: { username: 'admin' },
      relations: ['company'],
    });

    if (admin) {
      admin.passwordHash = hash;
      admin.isLocked = false;
      admin.failedLoginCount = 0;
      admin.mustChangePassword = true;
      admin.isActive = true;
      admin.role = 'SYSTEM_ADMIN';
      admin.company = systemCompany;
      admin.displayName = admin.displayName || '관리자';
      await this.usersRepo.save(admin);
      return;
    }

    const user = this.usersRepo.create({
      username: 'admin',
      displayName: '관리자',
      passwordHash: hash,
      role: 'SYSTEM_ADMIN',
      isActive: true,
      isLocked: false,
      failedLoginCount: 0,
      mustChangePassword: true,
      company: systemCompany,
    });
    await this.usersRepo.save(user);
  }

  async getLoginHistory(userId: number, limit = 10): Promise<LoginHistory[]> {
    return this.historyRepo.find({
      where: { user: { id: userId } },
      order: { loginAt: 'DESC' },
      take: limit,
      relations: ['company'],
    });
  }

  async findCompanyByCode(companyCode: string): Promise<Company | null> {
    return this.companyRepo.findOne({ where: { code: companyCode } });
  }

  async ensureCompany(companyCode: string, companyName?: string): Promise<Company> {
    let company = await this.companyRepo.findOne({ where: { code: companyCode } });
    if (!company) {
      company = this.companyRepo.create({
        code: companyCode,
        name: companyName || companyCode,
        status: 'ACTIVE',
      });
      company = await this.companyRepo.save(company);
    }
    return company;
  }
}
