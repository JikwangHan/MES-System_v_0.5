import { Body, Controller, Get, Patch, Post, UseGuards, Param, ParseIntPipe } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { Roles } from '../common/roles.decorator';
import { RolesGuard } from '../common/roles.guard';

// 시스템 관리자 전용 회사 관리 컨트롤러
@Controller('admin/companies')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SYSTEM_ADMIN')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  // 회사 목록 조회
  @Get()
  async findAll() {
    return this.companyService.findAll();
  }

  // 회사 생성
  @Post()
  async create(@Body() dto: CreateCompanyDto) {
    return this.companyService.create(dto);
  }

  // 회사 수정(이름/상태)
  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCompanyDto) {
    return this.companyService.update(id, dto);
  }
}
