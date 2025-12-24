import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { JwtPayload } from '../auth/types/jwt-payload.type';
import type { CreateSaleDto } from './dto/create-sale.dto';
import { InventoryMovementType, Prisma } from '@prisma/client';

@Injectable()
export class SalesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a sale (POS checkout)
   */
  async createSale(user: JwtPayload, dto: CreateSaleDto) {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('Sale must have at least one item');
    }

    return this.prisma.$transaction(async (tx) => {
      let total = 0;

      /**
       * 1️⃣ Load products + inventory
       */
      const products = await tx.product.findMany({
        where: {
          id: { in: dto.items.map((i) => BigInt(i.productId)) },
          tenantId: BigInt(user.tenantId),
          isActive: true,
        },
        include: {
          inventory: true,
        },
      });

      /**
       * 2️⃣ Validate products & stock
       */
      for (const item of dto.items) {
        const product = products.find((p) => p.id === BigInt(item.productId));

        if (!product) {
          throw new BadRequestException('Invalid product');
        }

        const inventory = product.inventory;
        if (!inventory) {
          throw new BadRequestException(
            `Inventory not found for ${product.name}`,
          );
        }

        if (inventory.quantity < item.quantity) {
          throw new BadRequestException(
            `Insufficient stock for ${product.name}`,
          );
        }

        total += Number(product.price) * item.quantity;
      }

      /**
       * 3️⃣ Create sale
       */
      const sale = await tx.sale.create({
        data: {
          tenantId: BigInt(user.tenantId),
          cashierId: BigInt(user.sub),
          total,
        },
      });

      /**
       * 4️⃣ Create sale items, inventory movements, update inventory
       */
      for (const item of dto.items) {
        const product = products.find((p) => p.id === BigInt(item.productId));

        if (!product || !product.inventory) {
          throw new BadRequestException('Invalid product state');
        }

        const inventory = product.inventory;

        // Sale item
        await tx.saleItem.create({
          data: {
            saleId: sale.id,
            productId: product.id,
            quantity: item.quantity,
            price: product.price,
          },
        });

        // Inventory movement (ledger)
        await tx.inventoryMovement.create({
          data: {
            tenantId: BigInt(user.tenantId),
            productId: product.id,
            type: InventoryMovementType.SALE,
            quantity: -item.quantity,
            reference: `SALE-${sale.id.toString()}`,
            createdBy: BigInt(user.sub),
          },
        });

        // Inventory summary update
        await tx.inventory.update({
          where: { productId: product.id },
          data: {
            quantity: inventory.quantity - item.quantity,
          },
        });
      }

      /**
       * 5️⃣ Return receipt (API-safe)
       */
      return {
        saleId: sale.id.toString(),
        total,
        items: dto.items,
        createdAt: sale.createdAt.toISOString(),
      };
    });
  }

  /**
   * List sales (reports)
   */
  async listSales(user: JwtPayload, from?: string, to?: string) {
    const where: Prisma.SaleWhereInput = {
      tenantId: BigInt(user.tenantId),
    };

    if (from || to) {
      where.createdAt = {};
      if (from) {
        where.createdAt.gte = new Date(from);
      }
      if (to) {
        where.createdAt.lte = new Date(to);
      }
    }

    const sales = await this.prisma.sale.findMany({
      where,
      include: {
        cashier: { select: { fullName: true } },
        items: {
          include: {
            product: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return sales.map((sale) => ({
      saleId: sale.id.toString(),
      total: Number(sale.total),
      cashier: sale.cashier.fullName,
      createdAt: sale.createdAt.toISOString(),
      items: sale.items.map((item) => ({
        product: item.product.name,
        quantity: item.quantity,
        price: Number(item.price),
      })),
    }));
  }

  /**
   * Get a single sale (receipt view)
   */
  async getSale(user: JwtPayload, saleId: bigint) {
    const sale = await this.prisma.sale.findFirst({
      where: {
        id: saleId,
        tenantId: BigInt(user.tenantId),
      },
      include: {
        cashier: { select: { fullName: true } },
        items: {
          include: {
            product: { select: { name: true } },
          },
        },
      },
    });

    if (!sale) {
      throw new BadRequestException('Sale not found');
    }

    return {
      saleId: sale.id.toString(),
      total: Number(sale.total),
      cashier: sale.cashier.fullName,
      createdAt: sale.createdAt.toISOString(),
      items: sale.items.map((item) => ({
        product: item.product.name,
        quantity: item.quantity,
        price: Number(item.price),
      })),
    };
  }

  /**
   * Refund a sale (full refund)
   */
  async refundSale(user: JwtPayload, saleId: bigint) {
    return this.prisma.$transaction(async (tx) => {
      const sale = await tx.sale.findFirst({
        where: {
          id: saleId,
          tenantId: BigInt(user.tenantId),
        },
        include: {
          items: true,
        },
      });

      if (!sale) {
        throw new BadRequestException('Sale not found');
      }

      if (sale.status === 'REFUNDED') {
        throw new BadRequestException('Sale already refunded');
      }

      // Restore inventory + record movements
      for (const item of sale.items) {
        const inventory = await tx.inventory.findUnique({
          where: { productId: item.productId },
        });

        if (!inventory) {
          throw new BadRequestException('Inventory not found during refund');
        }

        await tx.inventoryMovement.create({
          data: {
            tenantId: BigInt(user.tenantId),
            productId: item.productId,
            type: InventoryMovementType.RETURN,
            quantity: item.quantity,
            reference: `REFUND-${sale.id.toString()}`,
            createdBy: BigInt(user.sub),
          },
        });

        await tx.inventory.update({
          where: { productId: item.productId },
          data: {
            quantity: inventory.quantity + item.quantity,
          },
        });
      }

      // Mark sale as refunded
      const updatedSale = await tx.sale.update({
        where: { id: sale.id },
        data: {
          status: 'REFUNDED',
        },
      });

      return {
        saleId: updatedSale.id.toString(),
        status: updatedSale.status,
        refundedAt: new Date().toISOString(),
      };
    });
  }

  async getReceipt(user: JwtPayload, saleId: bigint) {
    const sale = await this.prisma.sale.findFirst({
      where: {
        id: saleId,
        tenantId: BigInt(user.tenantId),
      },
      include: {
        tenant: { select: { name: true, currency: true } },
        cashier: { select: { fullName: true } },
        items: {
          include: {
            product: { select: { name: true } },
          },
        },
      },
    });

    if (!sale) {
      throw new BadRequestException('Sale not found');
    }

    const items = sale.items.map((i) => ({
      name: i.product.name,
      qty: i.quantity,
      price: Number(i.price),
      total: Number(i.price) * i.quantity,
    }));

    return {
      store: {
        name: sale.tenant.name,
        currency: sale.tenant.currency,
      },
      receiptNo: `SALE-${sale.id.toString()}`,
      cashier: sale.cashier.fullName,
      date: sale.createdAt.toISOString(),
      items,
      subtotal: items.reduce((s, i) => s + i.total, 0),
      total: Number(sale.total),
      footer: 'Thank you for shopping!',
    };
  }
}
