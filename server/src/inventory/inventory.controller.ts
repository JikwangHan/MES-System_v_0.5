import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';
import { ListInventoryDto } from './dto/list-inventory.dto';

@Controller('inventory')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  @Roles('SYSTEM_ADMIN', 'COMPANY_ADMIN', 'USER')
  async list(@Req() req: any, @Query() query: ListInventoryDto) {
    return this.inventoryService.findAll(req.user, query);
  }
}
