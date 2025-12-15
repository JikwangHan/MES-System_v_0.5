import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';
import { ListOrdersDto } from './dto/list-orders.dto';
import { Body, Param, ParseIntPipe, Post, Patch, Delete } from '@nestjs/common';

@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @Roles('SYSTEM_ADMIN', 'COMPANY_ADMIN', 'USER')
  async list(@Req() req: any, @Query() query: ListOrdersDto) {
    return this.ordersService.findAll(req.user, query, req.tenantId);
  }

  @Post()
  @Roles('SYSTEM_ADMIN', 'COMPANY_ADMIN')
  async create(@Req() req: any, @Body() body: any) {
    return this.ordersService.create(req.user, body, req.tenantId);
  }

  @Patch(':id')
  @Roles('SYSTEM_ADMIN', 'COMPANY_ADMIN')
  async update(@Req() req: any, @Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.ordersService.update(req.user, id, body, req.tenantId);
  }

  @Delete(':id')
  @Roles('SYSTEM_ADMIN', 'COMPANY_ADMIN')
  async remove(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.ordersService.remove(req.user, id, req.tenantId);
  }
}
