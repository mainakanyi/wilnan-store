import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { JwtPayload } from '../auth/types/jwt-payload.type';
import type { CreateProductDto } from './dto/create-product.dto';
import type { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create product + inventory summary
   */
  async createProduct(user: JwtPayload, dto: CreateProductDto) {
    try {
      const result = await this.prisma.$transaction(async (tx) => {
        const product = await tx.product.create({
          data: {
            tenantId: BigInt(user.tenantId),
            name: dto.name,
            sku: dto.sku,
            price: dto.price,
          },
          select: {
            id: true,
            name: true,
            sku: true,
            price: true,
            isActive: true,
            createdAt: true,
          },
        });

        const inventory = await tx.inventory.create({
          data: {
            productId: product.id,
            quantity: dto.initialQuantity,
            lowStock: dto.lowStock ?? 5,
          },
          select: {
            quantity: true,
            lowStock: true,
          },
        });

        return { product, inventory };
      });

      return {
        id: result.product.id.toString(),
        name: result.product.name,
        sku: result.product.sku,
        price: Number(result.product.price),
        isActive: result.product.isActive,
        createdAt: result.product.createdAt.toISOString(),
        inventory: result.inventory,
      };
    } catch {
      throw new BadRequestException('Product already exists');
    }
  }

  /**
   * List products for tenant (POS-safe)
   */
  async listProducts(user: JwtPayload) {
    const products = await this.prisma.product.findMany({
      where: {
        tenantId: BigInt(user.tenantId),
        isActive: true,
      },
      include: {
        inventory: {
          select: {
            quantity: true,
            lowStock: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return products.map((p) => ({
      id: p.id.toString(),
      name: p.name,
      sku: p.sku,
      price: Number(p.price),
      isActive: p.isActive,
      createdAt: p.createdAt.toISOString(),
      inventory: p.inventory
        ? {
            quantity: p.inventory.quantity,
            lowStock: p.inventory.lowStock,
          }
        : null,
    }));
  }

  /**
   * Get a single product (tenant-safe)
   */
  async getProduct(user: JwtPayload, productId: bigint) {
    const product = await this.prisma.product.findFirst({
      where: {
        id: productId,
        tenantId: BigInt(user.tenantId),
      },
      include: {
        inventory: {
          select: {
            quantity: true,
            lowStock: true,
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return {
      id: product.id.toString(),
      name: product.name,
      sku: product.sku,
      price: Number(product.price),
      isActive: product.isActive,
      createdAt: product.createdAt.toISOString(),
      inventory: product.inventory
        ? {
            quantity: product.inventory.quantity,
            lowStock: product.inventory.lowStock,
          }
        : null,
    };
  }

  /**
   * Update product details (NOT inventory)
   */
  async updateProduct(
    user: JwtPayload,
    productId: bigint,
    dto: UpdateProductDto,
  ) {
    const existing = await this.prisma.product.findFirst({
      where: {
        id: productId,
        tenantId: BigInt(user.tenantId),
      },
    });

    if (!existing) {
      throw new NotFoundException('Product not found');
    }

    const updated = await this.prisma.product.update({
      where: { id: productId },
      data: dto,
      select: {
        id: true,
        name: true,
        sku: true,
        price: true,
        isActive: true,
        createdAt: true,
      },
    });

    return {
      id: updated.id.toString(),
      name: updated.name,
      sku: updated.sku,
      price: Number(updated.price),
      isActive: updated.isActive,
      createdAt: updated.createdAt.toISOString(),
    };
  }

  /**
   * Manual inventory adjustment (Step 2 only)
   */
  async updateInventory(user: JwtPayload, productId: bigint, quantity: number) {
    const inventory = await this.prisma.inventory.findFirst({
      where: {
        productId,
        product: {
          tenantId: BigInt(user.tenantId),
        },
      },
      select: {
        productId: true,
      },
    });

    if (!inventory) {
      throw new NotFoundException('Inventory not found');
    }

    const updated = await this.prisma.inventory.update({
      where: { productId },
      data: { quantity },
      select: {
        quantity: true,
        lowStock: true,
      },
    });

    return {
      productId: productId.toString(),
      quantity: updated.quantity,
      lowStock: updated.lowStock,
    };
  }
}
