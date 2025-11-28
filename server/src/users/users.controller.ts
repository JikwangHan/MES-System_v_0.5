import { Body, Controller, Get, Patch, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { Query } from '@nestjs/common';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // 내 정보 조회
  @Get('me')
  async me(@Req() req: any) {
    const user = await this.usersService.findById(req.user.userId);
    if (!user) return null;
    const { passwordHash, ...safe } = user;
    return safe;
  }

  // 내 정보 수정 (이름/연락처/업체명 등)
  @Patch('me')
  async updateProfile(@Req() req: any, @Body() dto: UpdateProfileDto) {
    const updated = await this.usersService.updateProfile(req.user.userId, dto);
    const { passwordHash, ...safe } = updated;
    return safe;
  }

  // 로그인 이력 조회 (최근 n건, 기본 10건)
  @Get('me/history')
  async history(@Req() req: any, @Query('limit') limit?: string) {
    const take = Number(limit) || 10;
    const logs = await this.usersService.getLoginHistory(req.user.userId, take);
    return logs.map((item) => ({
      id: item.id,
      loginAt: item.loginAt,
      success: item.success,
      failReason: item.failReason,
      ip: item.ip,
      userAgent: item.userAgent,
    }));
  }
}
