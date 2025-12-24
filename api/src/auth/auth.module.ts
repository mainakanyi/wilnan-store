import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { mustGetEnv } from '../config/env';
import type ms from 'ms';
// Configures how JWT tokens are created and validated.

const expiresIn = (process.env.JWT_EXPIRES_IN ?? '15m') as ms.StringValue;
@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: mustGetEnv('JWT_SECRET'),
      signOptions: { expiresIn },
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
