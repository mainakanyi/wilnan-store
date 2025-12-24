import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { JwtPayload } from '../auth/types/jwt-payload.type';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getKpis(user: JwtPayload) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // Fetch today's sales
    const sales = await this.prisma.sale.findMany({
      where: {
        tenantId: BigInt(user.tenantId),
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
      },
      select: {
        total: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    let grossSales = 0;
    let refunds = 0;
    let transactions = 0;

    for (const sale of sales) {
      if (sale.status === 'COMPLETED') {
        grossSales += Number(sale.total);
        transactions++;
      }

      if (sale.status === 'REFUNDED') {
        refunds += Number(sale.total);
      }
    }

    // Low stock count
    const lowStockCount = await this.prisma.inventory.count({
      where: {
        product: {
          tenantId: BigInt(user.tenantId),
          isActive: true,
        },
        quantity: {
          lte: this.prisma.inventory.fields.lowStock,
        },
      },
    });

    return {
      date: today.toISOString().split('T')[0],
      grossSales,
      refunds,
      netSales: grossSales - refunds,
      transactions,
      lowStockCount,
      lastSaleAt: sales.length ? sales[0].createdAt.toISOString() : null,
    };
  }
}
