import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { JwtPayload } from '../auth/types/jwt-payload.type';

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * List low-stock products
   */
  async listLowStock(user: JwtPayload) {
    const rows = await this.prisma.inventory.findMany({
      where: {
        product: {
          tenantId: BigInt(user.tenantId),
          isActive: true,
        },
        quantity: {
          lte: this.prisma.inventory.fields.lowStock,
        },
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
          },
        },
      },
      orderBy: {
        quantity: 'asc',
      },
    });

    return rows.map((r) => ({
      productId: r.product.id.toString(),
      name: r.product.name,
      sku: r.product.sku,
      quantity: r.quantity,
      lowStock: r.lowStock,
    }));
  }

  /**
   * Check if a single product is low-stock
   */
  async isLowStock(user: JwtPayload, productId: bigint) {
    const inventory = await this.prisma.inventory.findFirst({
      where: {
        productId,
        product: {
          tenantId: BigInt(user.tenantId),
        },
      },
      select: {
        quantity: true,
        lowStock: true,
      },
    });

    if (!inventory) {
      return { lowStock: false };
    }

    return {
      lowStock: inventory.quantity <= inventory.lowStock,
      quantity: inventory.quantity,
      threshold: inventory.lowStock,
    };
  }
}
