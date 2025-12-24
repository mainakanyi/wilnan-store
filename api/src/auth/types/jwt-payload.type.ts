export interface JwtPayload {
  sub: string;
  tenantId: string;
  role: 'OWNER' | 'ADMIN' | 'CASHIER';
  email: string;
}

// This is exactly what you put into the JWT

// Now TypeScript knows the shape of user
