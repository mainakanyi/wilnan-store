import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/types/jwt-payload.type';
import { ReportsService } from './reports.service';
import { SubscriptionGuard } from 'src/billing/guards/subscription.guard';

@Controller('reports')
@UseGuards(AuthGuard('jwt'), RolesGuard, SubscriptionGuard)
export class ReportsController {
  constructor(private readonly reports: ReportsService) {}

  /**
   * Daily Z-report
   */
  @Get('z')
  @Roles('OWNER', 'ADMIN')
  zReport(@CurrentUser() user: JwtPayload, @Query('date') date?: string) {
    return this.reports.dailyZReport(user, date);
  }
}
