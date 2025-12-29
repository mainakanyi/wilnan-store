import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';

@Injectable()
export class PlanLimitsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSubscription(tenantId: bigint) {
    const subscription = await this.prisma.tenantSubscription.findUnique({
      where: { tenantId },
      include: { plan: true },
    });

    if (!subscription) {
      throw new ForbiddenException('Subscription not found');
    }

    return subscription;
  }

  async enforceUserLimit(tenantId: bigint) {
    const subscription = await this.getSubscription(tenantId);

    const count = await this.prisma.user.count({
      where: { tenantId },
    });

    if (count >= subscription.plan.maxUsers) {
      throw new ForbiddenException(
        'User limit reached for your subscription plan',
      );
    }
  }

  async enforceProductLimit(tenantId: bigint) {
    const subscription = await this.getSubscription(tenantId);

    const count = await this.prisma.product.count({
      where: {
        tenantId,
        isActive: true,
      },
    });

    if (count >= subscription.plan.maxProducts) {
      throw new ForbiddenException(
        'Product limit reached for your subscription plan',
      );
    }
  }

  async enforceReportsAccess(tenantId: bigint) {
    const subscription = await this.getSubscription(tenantId);

    if (!subscription.plan.allowReports) {
      throw new ForbiddenException('Reports are not available on your plan');
    }
  }
}
