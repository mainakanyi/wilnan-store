import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/types/jwt-payload.type';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';

@Controller('products')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ProductsController {
  constructor(private readonly products: ProductsService) {}

  @Post()
  @Roles('OWNER', 'ADMIN')
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateProductDto) {
    return this.products.createProduct(user, dto);
  }

  @Get()
  @Roles('OWNER', 'ADMIN', 'CASHIER')
  list(@CurrentUser() user: JwtPayload) {
    return this.products.listProducts(user);
  }

  @Get(':id')
  @Roles('OWNER', 'ADMIN', 'CASHIER')
  get(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.products.getProduct(user, BigInt(id));
  }

  @Patch(':id')
  @Roles('OWNER', 'ADMIN')
  update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.products.updateProduct(user, BigInt(id), dto);
  }

  @Patch(':id/inventory')
  @Roles('OWNER', 'ADMIN')
  updateInventory(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateInventoryDto,
  ) {
    return this.products.updateInventory(user, BigInt(id), dto.quantity);
  }
}
