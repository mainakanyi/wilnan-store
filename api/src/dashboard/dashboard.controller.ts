import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/types/jwt-payload.type';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class DashboardController {
  constructor(private readonly dashboard: DashboardService) {}

  @Get('kpis')
  @Roles('OWNER', 'ADMIN')
  kpis(@CurrentUser() user: JwtPayload) {
    return this.dashboard.getKpis(user);
  }
}
