import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';
import { ListInventoryDto } from './dto/list-inventory.dto';
import { Body, Param, ParseIntPipe, Patch, Post, Delete } from '@nestjs/common';

@Controller('inventory')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  @Roles('SYSTEM_ADMIN', 'COMPANY_ADMIN', 'USER')
  async list(@Req() req: any, @Query() query: ListInventoryDto) {
    return this.inventoryService.findAll(req.user, query, req.tenantId);
  }

  @Post()
  @Roles('SYSTEM_ADMIN', 'COMPANY_ADMIN')
  async create(@Req() req: any, @Body() body: any) {
    return this.inventoryService.create(req.user, body, req.tenantId);
  }

  @Patch(':id')
  @Roles('SYSTEM_ADMIN', 'COMPANY_ADMIN')
  async update(@Req() req: any, @Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.inventoryService.update(req.user, id, body, req.tenantId);
  }

  @Delete(':id')
  @Roles('SYSTEM_ADMIN', 'COMPANY_ADMIN')
  async remove(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.inventoryService.remove(req.user, id, req.tenantId);
  }
}
