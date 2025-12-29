import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/types/jwt-payload.type';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { SubscriptionGuard } from 'src/billing/guards/subscription.guard';

@Controller('sales')
@UseGuards(AuthGuard('jwt'), RolesGuard, SubscriptionGuard)
export class SalesController {
  constructor(private readonly sales: SalesService) {}

  /**
   * Create a sale (POS checkout)
   */
  @Post()
  @Roles('CASHIER', 'ADMIN')
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateSaleDto) {
    return this.sales.createSale(user, dto);
  }

  /**
   * List sales (reports)
   */
  @Get()
  @Roles('OWNER', 'ADMIN')
  list(
    @CurrentUser() user: JwtPayload,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.sales.listSales(user, from, to);
  }

  /**
   * Get single sale (receipt view)
   */
  @Get(':id')
  @Roles('OWNER', 'ADMIN')
  get(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.sales.getSale(user, BigInt(id));
  }

  /**
   * Refund a sale
   */
  @Post(':id/refund')
  @Roles('OWNER', 'ADMIN')
  refund(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.sales.refundSale(user, BigInt(id));
  }
}
