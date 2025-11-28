import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { User } from '../entities/user.entity';
import { LoginHistory } from '../entities/login-history.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    @InjectRepository(LoginHistory)
    private readonly loginHistoryRepo: Repository<LoginHistory>,
  ) {}

  async signup(dto: SignupDto): Promise<Omit<User, 'passwordHash'>> {
    if (dto.password !== dto.passwordConfirm) {
      throw new BadRequestException('비밀번호와 확인값이 일치하지 않습니다.');
    }
    const exists = await this.usersService.findByUsername(dto.username);
    if (exists) throw new BadRequestException('이미 등록된 아이디입니다.');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const allowedRoles = ['ADMIN', 'OPERATOR', 'MERCHANT'];
    const role = allowedRoles.includes(dto.role) ? dto.role : 'MERCHANT';
    const user = await this.usersService.create({
      username: dto.username,
      displayName: dto.displayName,
      passwordHash,
      phone: dto.phone,
      companyName: dto.companyName,
      role,
      isActive: true,
      isLocked: false,
      failedLoginCount: 0,
      mustChangePassword: false,
    });
    const { passwordHash: _, ...rest } = user;
    return rest;
  }

  async login(dto: LoginDto, context?: { ip?: string; userAgent?: string }) {
    const user = await this.usersService.findByUsername(dto.username);
    if (!user || !user.isActive) {
      await this.saveLoginHistory(user, false, 'USER_NOT_FOUND', context);
      throw new UnauthorizedException('아이디 또는 비밀번호를 다시 확인해 주세요.');
    }
    if (user.isLocked) {
      await this.saveLoginHistory(user, false, 'LOCKED', context);
      throw new ForbiddenException('계정이 잠겨 있습니다. 관리자에게 문의하세요.');
    }
    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) {
      await this.usersService.bumpFailedLogin(user);
      await this.saveLoginHistory(user, false, 'WRONG_PASSWORD', context);
      throw new UnauthorizedException('아이디 또는 비밀번호를 다시 확인해 주세요.');
    }

    await this.usersService.resetFailedLoginAndUpdateLoginAt(user);
    await this.saveLoginHistory(user, true, null, context);

    const payload = { sub: user.id, username: user.username, role: user.role, mustChangePassword: user.mustChangePassword };
    const token = await this.jwtService.signAsync(payload);
    const { passwordHash, ...safeUser } = user;
    return { token, user: safeUser };
  }

  async changePassword(userId: number, dto: ChangePasswordDto) {
    if (dto.newPassword !== dto.newPasswordConfirm) {
      throw new BadRequestException('새 비밀번호와 확인값이 일치하지 않습니다.');
    }
    const user = await this.usersService.findById(userId);
    if (!user) throw new UnauthorizedException('사용자를 찾을 수 없습니다.');

    const ok = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!ok) throw new UnauthorizedException('현재 비밀번호가 일치하지 않습니다.');

    const newHash = await bcrypt.hash(dto.newPassword, 10);
    await this.usersService.updatePassword(user, newHash);
    return { message: '비밀번호가 변경되었습니다.' };
  }

  private async saveLoginHistory(
    user: User | null,
    success: boolean,
    failReason?: string | null,
    context?: { ip?: string; userAgent?: string },
  ) {
    if (!user) return;
    const history = this.loginHistoryRepo.create({
      user,
      success,
      failReason: failReason || null,
      ip: context?.ip || null,
      userAgent: context?.userAgent || null,
    });
    await this.loginHistoryRepo.save(history);
  }
}
