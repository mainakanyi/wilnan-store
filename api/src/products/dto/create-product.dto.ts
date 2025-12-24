import { IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsNumber()
  price: number;

  @IsInt()
  @Min(0)
  initialQuantity: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  lowStock?: number;
}
