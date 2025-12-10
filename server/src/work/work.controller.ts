import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';
import { WorkService } from './work.service';
import { CreateWorkOrderDto } from './dto/create-work-order.dto';

@Controller('work')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WorkController {
  constructor(private readonly workService: WorkService) {}

  // 작업지시 목록 조회: 모든 역할 조회 가능 (자사 데이터)
  @Get('orders')
  @Roles('SYSTEM_ADMIN', 'COMPANY_ADMIN', 'USER')
  async listOrders(@Req() req: any, @Query() query: any) {
    return this.workService.findAll(req.user, query);
  }

  // 작업지시 생성: 관리자/운영자
  @Post('orders')
  @Roles('SYSTEM_ADMIN', 'COMPANY_ADMIN')
  async createOrder(@Req() req: any, @Body() dto: CreateWorkOrderDto) {
    return this.workService.create(req.user, dto);
  }

  // 공정 목록 조회
  @Get('orders/:id/operations')
  @Roles('SYSTEM_ADMIN', 'COMPANY_ADMIN', 'USER')
  async listOperations(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.workService.findOperations(req.user, id);
  }

  // 실적 목록 조회
  @Get('orders/:id/results')
  @Roles('SYSTEM_ADMIN', 'COMPANY_ADMIN', 'USER')
  async listResults(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.workService.findResults(req.user, id);
  }
}
