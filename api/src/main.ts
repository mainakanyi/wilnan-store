import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BigIntInterceptor } from './common/interceptors/bigint.interceptor';
// Switches main.ts to Fastify
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';

async function bootstrap() {
  // NestFactory.create(...): bootstraps your Nest app.
  // NestFastifyApplication + FastifyAdapter: tells Nest to use Fastify.
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  app.useGlobalInterceptors(new BigIntInterceptor());

  // setGlobalPrefix('v1'): versions your API. Later you can release /v2 without breaking old customers.
  app.setGlobalPrefix('v1'); // makes routes like /v1/auth/login

  // listen({ port, host }): starts server. 0.0.0.0 allows access from other devices on LAN (optional but helpful).
  await app.listen({ port: 3000, host: '0.0.0.0' });
}
bootstrap();
