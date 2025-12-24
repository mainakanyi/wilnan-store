import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/types/jwt-payload.type';
import { InventoryService } from './inventory.service';

@Controller('inventory')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class InventoryController {
  constructor(private readonly inventory: InventoryService) {}

  /**
   * List all low-stock products
   */
  @Get('low-stock')
  @Roles('OWNER', 'ADMIN')
  list(@CurrentUser() user: JwtPayload) {
    return this.inventory.listLowStock(user);
  }

  /**
   * Check if a product is low-stock
   */
  @Get('products/:id/low-stock')
  @Roles('OWNER', 'ADMIN')
  check(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.inventory.isLowStock(user, BigInt(id));
  }
}
