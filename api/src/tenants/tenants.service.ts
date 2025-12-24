import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { JwtPayload } from '../auth/types/jwt-payload.type';

@Injectable()
export class TenantsService {
  constructor(private readonly prisma: PrismaService) {}

  async getMyTenant(user: JwtPayload) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: BigInt(user.tenantId) },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    return {
      id: tenant.id.toString(),
      name: tenant.name,
      slug: tenant.slug,
      currency: tenant.currency,
      timezone: tenant.timezone,
      createdAt: tenant.createdAt,
    };
  }

  async updateMyTenant(
    user: JwtPayload,
    data: { name?: string; currency?: string; timezone?: string },
  ) {
    const tenant = await this.prisma.tenant.update({
      where: { id: BigInt(user.tenantId) },
      data,
    });

    return {
      id: tenant.id.toString(),
      name: tenant.name,
      slug: tenant.slug,
      currency: tenant.currency,
      timezone: tenant.timezone,
      createdAt: tenant.createdAt,
    };
  }
}
