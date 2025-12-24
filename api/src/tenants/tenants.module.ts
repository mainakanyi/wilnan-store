import { Module } from '@nestjs/common';
import { TenantsController } from '../tenants/tenants.controller';
import { TenantsService } from '../tenants/tenants.service';

@Module({
  controllers: [TenantsController],
  providers: [TenantsService],
})
export class TenantsModule {}
