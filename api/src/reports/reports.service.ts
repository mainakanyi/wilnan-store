import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { JwtPayload } from '../auth/types/jwt-payload.type';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Daily Z-report
   */
  async dailyZReport(user: JwtPayload, date?: string) {
    const targetDate = date ? new Date(date) : new Date();

    // Normalize to day range
    const start = new Date(targetDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(targetDate);
    end.setHours(23, 59, 59, 999);

    const sales = await this.prisma.sale.findMany({
      where: {
        tenantId: BigInt(user.tenantId),
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      select: {
        total: true,
        status: true,
      },
    });

    let grossSales = 0;
    let refunds = 0;
    let transactions = 0;
    let refundCount = 0;

    for (const sale of sales) {
      if (sale.status === 'COMPLETED') {
        grossSales += Number(sale.total);
        transactions++;
      }

      if (sale.status === 'REFUNDED') {
        refunds += Number(sale.total);
        refundCount++;
      }
    }

    return {
      date: start.toISOString().split('T')[0],
      grossSales,
      refunds,
      netSales: grossSales - refunds,
      transactions,
      refundCount,
    };
  }
}
