import { SetMetadata } from '@nestjs/common';
// Add a Roles Guard (so only OWNER/ADMIN can create users)
export const ROLES_KEY = 'roles';
export const Roles = (...roles: Array<'OWNER' | 'ADMIN' | 'CASHIER'>) =>
  SetMetadata(ROLES_KEY, roles);
