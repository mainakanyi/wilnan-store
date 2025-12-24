import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { mustGetEnv } from '../config/env';
import type { JwtPayload } from './types/jwt-payload.type';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: mustGetEnv('JWT_SECRET'),
    });
  }

  validate(payload: JwtPayload): JwtPayload {
    // Why: returning a typed payload makes req.user typed and safe
    return payload;
  }
}
