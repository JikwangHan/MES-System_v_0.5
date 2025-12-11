import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';
import { ListOrdersDto } from './dto/list-orders.dto';

@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @Roles('SYSTEM_ADMIN', 'COMPANY_ADMIN', 'USER')
  async list(@Req() req: any, @Query() query: ListOrdersDto) {
    return this.ordersService.findAll(req.user, query);
  }
}
