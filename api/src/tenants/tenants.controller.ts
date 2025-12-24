import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TenantsService } from './tenants.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/types/jwt-payload.type';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('tenants')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  // GET /tenants/me
  @Get('me')
  getMyTenant(@CurrentUser() user: JwtPayload) {
    return this.tenantsService.getMyTenant(user);
  }

  // PATCH /tenants/me
  @Patch('me')
  @Roles('OWNER', 'ADMIN')
  updateMyTenant(
    @CurrentUser() user: JwtPayload,
    @Body() body: { name?: string; currency?: string; timezone?: string },
  ) {
    return this.tenantsService.updateMyTenant(user, body);
  }
}
