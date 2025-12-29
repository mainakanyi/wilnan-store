import type { JwtPayload } from '../auth/types/jwt-payload.type';

declare module 'fastify' {
  interface FastifyRequest {
    user: JwtPayload;
  }
}
