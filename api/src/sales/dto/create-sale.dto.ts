import { IsArray, IsInt, Min } from 'class-validator';

class SaleItemDto {
  @IsInt()
  productId: number;

  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreateSaleDto {
  @IsArray()
  items: SaleItemDto[];
}
