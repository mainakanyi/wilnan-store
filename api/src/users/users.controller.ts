import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/types/jwt-payload.type';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('users')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // GET /users
  @Get()
  @Roles('OWNER', 'ADMIN')
  listUsers(@CurrentUser() user: JwtPayload) {
    return this.usersService.listUsers(user);
  }

  @Get(':id')
  @Roles('OWNER', 'ADMIN')
  getById(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.usersService.getUserById(user, BigInt(id));
  }

  // POST /users
  @Post()
  @Roles('OWNER', 'ADMIN')
  createUser(
    @CurrentUser() user: JwtPayload,
    @Body()
    body: {
      email: string;
      fullName: string;
      role: 'ADMIN' | 'CASHIER';
      password: string;
    },
  ) {
    return this.usersService.createUser(user, body);
  }

  // PATCH /users/:id
  @Patch(':id')
  @Roles('OWNER', 'ADMIN')
  updateUser(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body()
    body: { fullName?: string; role?: 'ADMIN' | 'CASHIER'; isActive?: boolean },
  ) {
    return this.usersService.updateUser(user, BigInt(id), body);
  }
}
