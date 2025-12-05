import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards, Req, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';
import { UsersService } from './users.service';
import { AdminCreateUserDto } from './dto/admin-create-user.dto';
import { AdminUpdateUserDto } from './dto/admin-update-user.dto';
import * as bcrypt from 'bcrypt';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminUsersController {
  constructor(private readonly usersService: UsersService) {}

  // 시스템 관리자: 모든 사용자 조회, companyCode로 필터 가능
  @Get('admin/users')
  @Roles('SYSTEM_ADMIN')
  async findAll(@Query('companyCode') companyCode?: string) {
    const users = await this.usersService.findAll(companyCode);
    return users.map((u) => {
      const { passwordHash, ...safe } = u;
      return safe;
    });
  }

  // 회사 관리자/시스템 관리자: 자기 회사 사용자 조회
  @Get('company/users')
  @Roles('SYSTEM_ADMIN', 'COMPANY_ADMIN')
  async findByCompany(@Query('companyCode') companyCode: string, @Req() req: any) {
    // SYSTEM_ADMIN: query companyCode 우선, 없으면 전체
    // COMPANY_ADMIN: 자신의 회사 기준 (companyId로 조회 후 code 추출)
    let targetCode: string | undefined = companyCode;
    if (!targetCode && req.user?.companyId) {
      const me = await this.usersService.findById(req.user.userId);
      targetCode = me?.company?.code;
    }
    const users = await this.usersService.findAll(targetCode);
    return users.map((u) => {
      const { passwordHash, ...safe } = u;
      return safe;
    });
  }

  // 시스템 관리자: 사용자 생성 (비밀번호 해시 포함)
  @Post('admin/users')
  @Roles('SYSTEM_ADMIN')
  async create(@Body() dto: AdminCreateUserDto) {
    const existing = await this.usersService.findByUsernameAndCompany(dto.username, dto.companyCode);
    if (existing) {
      throw new BadRequestException('이미 존재하는 사용자입니다.');
    }
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const company = await this.usersService.ensureCompany(dto.companyCode, dto.companyName || dto.companyCode);
    const user = await this.usersService.create({
      username: dto.username,
      displayName: dto.displayName,
      passwordHash,
      role: dto.role,
      company,
      companyName: dto.companyName,
      phone: dto.phone,
      isActive: true,
      isLocked: false,
      failedLoginCount: 0,
      mustChangePassword: false,
    });
    const { passwordHash: _, ...safe } = user;
    return safe;
  }

  // 시스템 관리자: 사용자 정보/상태/역할 수정
  @Patch('admin/users/:id')
  @Roles('SYSTEM_ADMIN')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: AdminUpdateUserDto) {
    const user = await this.usersService.findById(id);
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }
    if (dto.displayName !== undefined) user.displayName = dto.displayName;
    if (dto.phone !== undefined) user.phone = dto.phone;
    if (dto.role !== undefined) user.role = dto.role;
    if (dto.isActive !== undefined) user.isActive = dto.isActive;
    const saved = await this.usersService.save(user);
    const { passwordHash, ...safe } = saved;
    return safe;
  }
}
