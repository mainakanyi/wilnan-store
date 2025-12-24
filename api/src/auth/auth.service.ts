import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { FastifyRequest } from 'fastify';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '../../prisma/prisma.service';
import type { RegisterOwnerDto } from './dto/register-owner.dto';
import type { LoginDto } from './dto/login.dto';
import type { JwtPayload } from './types/jwt-payload.type';
import { resolveTenantSlug } from './utils/tenant-resolver';

type AuthResponse = { accessToken: string };

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  /**
   * Creates a new tenant + the first OWNER user.
   * SaaS onboarding entry point.
   */
  async registerOwner(input: RegisterOwnerDto): Promise<AuthResponse> {
    const { tenantName, tenantSlug, fullName, email, password } = input;

    const existingTenant = await this.prisma.tenant.findUnique({
      where: { slug: tenantSlug },
    });
    if (existingTenant) {
      throw new BadRequestException('Tenant slug already exists');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const { user } = await this.prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: { name: tenantName, slug: tenantSlug },
      });

      const user = await tx.user.create({
        data: {
          tenantId: tenant.id,
          fullName,
          email,
          passwordHash,
          role: 'OWNER',
        },
      });

      return { user };
    });

    return this.issueToken({
      sub: user.id.toString(),
      tenantId: user.tenantId.toString(),
      role: user.role,
      email: user.email,
    });
  }

  /**
   * LEGACY login (kept for Postman / admin testing)
   * Can be removed later.
   */
  // async login(input: LoginDto): Promise<AuthResponse> {
  //   const { tenantSlug, email, password } = input;

  //   const tenant = await this.prisma.tenant.findUnique({
  //     where: { slug: tenantSlug },
  //   });
  //   if (!tenant) {
  //     throw new UnauthorizedException('Invalid login');
  //   }

  //   const user = await this.prisma.user.findUnique({
  //     where: {
  //       tenantId_email: {
  //         tenantId: tenant.id,
  //         email,
  //       },
  //     },
  //   });

  //   if (!user || !user.isActive) {
  //     throw new UnauthorizedException('Invalid login');
  //   }

  //   const ok = await bcrypt.compare(password, user.passwordHash);
  //   if (!ok) {
  //     throw new UnauthorizedException('Invalid login');
  //   }

  //   return this.issueToken({
  //     sub: user.id.toString(),
  //     tenantId: tenant.id.toString(),
  //     role: user.role,
  //     email: user.email,
  //   });
  // }

  /**
   * DOMAIN-BASED login (POS / Storefront / Admin)
   * Tenant is inferred from request host or dev header.
   */
  async loginWithDomain(
    req: FastifyRequest,
    input: LoginDto,
  ): Promise<AuthResponse> {
    const tenantSlug = resolveTenantSlug(req);

    if (!tenantSlug) {
      throw new UnauthorizedException('Tenant could not be resolved');
    }

    const tenant = await this.prisma.tenant.findUnique({
      where: { slug: tenantSlug },
    });

    if (!tenant) {
      throw new UnauthorizedException('Invalid tenant');
    }

    const user = await this.prisma.user.findUnique({
      where: {
        tenantId_email: {
          tenantId: tenant.id,
          email: input.email,
        },
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid login');
    }

    const ok = await bcrypt.compare(input.password, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException('Invalid login');
    }

    return this.issueToken({
      sub: user.id.toString(),
      tenantId: tenant.id.toString(),
      role: user.role,
      email: user.email,
    });
  }

  private issueToken(payload: JwtPayload): AuthResponse {
    return { accessToken: this.jwt.sign(payload) };
  }
}
