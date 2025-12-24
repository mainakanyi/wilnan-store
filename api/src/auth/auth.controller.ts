import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { FastifyRequest } from 'fastify';

import { AuthService } from './auth.service';
import { RegisterOwnerDto } from './dto/register-owner.dto';
import { LoginDto } from './dto/login.dto';
import { CurrentUser } from './decorators/current-user.decorator';
import type { JwtPayload } from './types/jwt-payload.type';

@Controller()
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  // Onboards a new business (creates tenant + owner)
  @Post('/auth/register-owner')
  registerOwner(@Body() body: RegisterOwnerDto) {
    return this.auth.registerOwner(body);
  }

  // DOMAIN-BASED login (POS / Admin / Storefront)
  @Post('/auth/login')
  login(@Req() req: FastifyRequest, @Body() body: LoginDto) {
    return this.auth.loginWithDomain(req, body);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/me')
  me(@CurrentUser() user: JwtPayload) {
    return { user };
  }
}
