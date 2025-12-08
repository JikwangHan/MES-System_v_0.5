import { Body, Controller, Get, Param, ParseIntPipe, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';
import { EquipmentService } from './equipment.service';
import { CreateEquipmentDto } from './dto/create-equipment.dto';

@Controller('equipment')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EquipmentController {
  constructor(private readonly equipmentService: EquipmentService) {}

  // 설비 목록 조회: 모든 역할이 조회 가능 (자사 데이터만)
  @Get()
  @Roles('SYSTEM_ADMIN', 'COMPANY_ADMIN', 'USER')
  async list(@Req() req: any) {
    return this.equipmentService.findAll(req.user);
  }

  // 설비 생성: SYSTEM_ADMIN/COMPANY_ADMIN만
  @Post()
  @Roles('SYSTEM_ADMIN', 'COMPANY_ADMIN')
  async create(@Req() req: any, @Body() dto: CreateEquipmentDto) {
    return this.equipmentService.create(req.user, dto);
  }

  // 설비 이벤트 조회: 읽기 전용
  @Get(':id/events')
  @Roles('SYSTEM_ADMIN', 'COMPANY_ADMIN', 'USER')
  async events(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.equipmentService.findEvents(req.user, id);
  }

  // 설비 센서 데이터 조회: 읽기 전용
  @Get(':id/sensors')
  @Roles('SYSTEM_ADMIN', 'COMPANY_ADMIN', 'USER')
  async sensors(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.equipmentService.findSensors(req.user, id);
  }
}
