/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import type { JwtPayload } from '../auth/types/jwt-payload.type';
import type { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  // LIST USERS
  async listUsers(user: JwtPayload) {
    return this.prisma.user.findMany({
      where: {
        tenantId: BigInt(user.tenantId),
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });
  }

  async getUserById(user: JwtPayload, userId: bigint) {
    const found = await this.prisma.user.findFirst({
      where: {
        id: userId,
        tenantId: BigInt(user.tenantId),
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!found) {
      throw new NotFoundException('User not found');
    }

    return found;
  }

  // CREATE USER
  async createUser(user: JwtPayload, dto: CreateUserDto) {
    const passwordHash = await bcrypt.hash(dto.password, 10);

    try {
      return await this.prisma.user.create({
        data: {
          tenantId: BigInt(user.tenantId),
          email: dto.email,
          fullName: dto.fullName,
          role: dto.role,
          passwordHash,
        },
      });
    } catch {
      throw new BadRequestException(
        'User with this email already exists in this tenant',
      );
    }
  }

  // UPDATE USER
  async updateUser(
    user: JwtPayload,
    userId: bigint,
    data: {
      fullName?: string;
      role?: 'ADMIN' | 'CASHIER';
      isActive?: boolean;
    },
  ) {
    const existing = await this.prisma.user.findFirst({
      where: {
        id: userId,
        tenantId: BigInt(user.tenantId),
      },
    });

    if (!existing) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.user.update({
      where: { id: userId },
      data,
    });
  }
}
