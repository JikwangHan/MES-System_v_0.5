import { Controller, Get, Header, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  @Roles('SYSTEM_ADMIN', 'COMPANY_ADMIN', 'USER')
  @Header('Cache-Control', 'no-store')
  async summary(
    @Req() req: any,
    @Query('companyCode') companyCode?: string,
    @Query('period') period?: 'today' | 'week' | 'month',
  ) {
    return this.dashboardService.summary(req.user, companyCode, period || 'today');
  }
}
