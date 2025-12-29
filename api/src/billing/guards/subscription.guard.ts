import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<FastifyRequest>();

    // ✅ Now TS knows request.user exists
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Unauthenticated');
    }

    const subscription = await this.prisma.tenantSubscription.findUnique({
      where: {
        tenantId: BigInt(user.tenantId),
      },
    });

    if (!subscription) {
      throw new ForbiddenException('Subscription not found');
    }

    if (subscription.status === 'SUSPENDED') {
      throw new ForbiddenException('Subscription suspended');
    }

    if (new Date() > subscription.endDate) {
      throw new ForbiddenException('Subscription expired');
    }

    return true;
  }
}
